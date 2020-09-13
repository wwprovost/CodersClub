package codersclub.mail;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.junit.Before;
import org.junit.Test;

import codersclub.mail.Mailer.SendResult;

public class MockMailerTest {

	public static final String HOST = "localhost";
	public static final int PORT = 8025;
	public static final String USERNAME = "username";
	public static final String PASSWORD = "password";
	public static final String SENDER = "provost@tiac.net";
	public static final String BCC = "bcc@tiac.net";
	public static final String RECIPIENT = "provost@tiac.net";
	public static final List<String> RECIPIENTS = 
			Stream.of("provost@tiac.net", "provost@capcourse.com")
				.collect(Collectors.toList());
	public static final String SUBJECT = "Subject";
	public static final String BODY = "Body";
	
	private MockMailer mailer;
	
	@Before
	public void setUp()
	{
		MockMailer.messages.clear();
    	MockMailer.flunkAddress = false;
    	MockMailer.flunkAuthentication = false;
    	MockMailer.flunkSend = false;

		mailer = new MockMailer(HOST, PORT, SENDER);
	}

	@Test
	public void testProperties() 
	{
		assertEquals(HOST, mailer.getHost());
		assertEquals(PORT, mailer.getPort());
		assertEquals(SENDER, mailer.getSender());
	}
	
    @Test
	public void testSend() throws Exception 
    {
		SendResult result = mailer.send(RECIPIENT, SUBJECT, BODY, BCC);
		assertEquals(Mailer.SendOutcome.SENT, result.outcome);
		
		List<MockMailer.Message> emails = MockMailer.messages;
		assertEquals(1, emails.size());
		
		MockMailer.Message email = emails.get(0);
		assertEquals(SUBJECT, email.getSubject());
		assertEquals(RECIPIENT, email.getRecipient());
		assertEquals(BODY, email.getBody());
	}
	
    @Test
    public void testSendNullAddress() throws Exception
    {
    	SendResult result = mailer.send((String) null, SUBJECT, BODY, BCC);
    	assertEquals(Mailer.SendOutcome.BAD_ADDRESS, result.outcome);
    }

    @Test
    public void testSendBadAddress() throws Exception
    {
    	MockMailer.flunkAddress = true;
    	SendResult result = mailer.send(RECIPIENT, SUBJECT, BODY, BCC);
    	assertEquals(Mailer.SendOutcome.BAD_ADDRESS, result.outcome);
    }

    @Test
    public void testSendBadAuthentication() throws Exception
    {
    	MockMailer.flunkAuthentication = true;
    	SendResult result = mailer.send(RECIPIENT, SUBJECT, BODY, BCC);
    	assertEquals(Mailer.SendOutcome.AUTHENTICATION_FAILED, result.outcome);
    }

    @Test
    public void testSendSendFailed() throws Exception
    {
    	MockMailer.flunkSend = true;
    	SendResult result = mailer.send(RECIPIENT, SUBJECT, BODY, BCC);
    	assertEquals(Mailer.SendOutcome.OTHER, result.outcome);
    	assertTrue(result.errorMessage.endsWith("Configured to fail in testing."));
    }

    @Test
	public void testSendToList() throws Exception {
		
		List<SendResult> results = mailer.send(RECIPIENTS.stream(), SUBJECT, BODY, BCC);
		for (SendResult result : results)
			assertEquals(Mailer.SendOutcome.SENT, result.outcome);
		
		List<MockMailer.Message> emails = MockMailer.messages;
		assertEquals(RECIPIENTS.size() + 1, emails.size()); // extra is the single "BCC"
		
		for (int i = 0; i < emails.size() - 1; ++i) {
			MockMailer.Message email = emails.get(i);
			assertEquals(SUBJECT, email.getSubject());
			assertEquals(RECIPIENTS.get(i), email.getRecipient());
			assertEquals(BODY, email.getBody());
		}
		
		//TODO check the BCC message
	}
	
    @Test
	public void testSendToListWithDuplicates() throws Exception {
		
        Stream<String> dups = Stream.of("provost@tiac.net", "szelbow@gmail.com",
                "provost@tiac.net", "me@me.com", "szelbow@gmail.com");
		List<SendResult> results = mailer.send(dups, SUBJECT, BODY, BCC);
		for (SendResult result : results)
			assertEquals(Mailer.SendOutcome.SENT, result.outcome);
		
		List<MockMailer.Message> emails = MockMailer.messages;
		assertEquals(4, emails.size()); // 3 + single "BCC"
		
		for (int i = 0; i < emails.size() - 1; ++i) {
			MockMailer.Message email = emails.get(i);
			assertEquals(SUBJECT, email.getSubject());
			assertEquals(BODY, email.getBody());
		}
		
		//TODO check the BCC message
	}
	
    @Test
    public void testSendToListNullAddress() throws Exception
    {
    	String[] nullAddress = { null };
    	List<SendResult> results = mailer.send
    			(Stream.concat(RECIPIENTS.stream(), Stream.of(nullAddress)), 
    					SUBJECT, BODY, BCC);
    	
    	assertEquals(Mailer.SendOutcome.SENT, results.get(0).outcome);
    	assertEquals(Mailer.SendOutcome.SENT, results.get(1).outcome);
    	assertEquals(Mailer.SendOutcome.BAD_ADDRESS, results.get(2).outcome);
    }

    @Test
    public void testSendToListBadAddress() throws Exception
    {
    	MockMailer.flunkAddress = true;
    	for (SendResult result : mailer.send(RECIPIENTS.stream(), SUBJECT, BODY, BCC))
    		assertEquals(Mailer.SendOutcome.BAD_ADDRESS, result.outcome);
    }

    @Test
    public void testSendToListBadAuthentication() throws Exception
    {
    	MockMailer.flunkAuthentication = true;
    	List<SendResult> results = mailer.send(RECIPIENTS.stream(), SUBJECT, BODY, BCC);
    	assertEquals(1, results.size());
    	assertEquals(Mailer.SendOutcome.AUTHENTICATION_FAILED, results.get(0).outcome);
    }

    @Test
    public void testSendToListSendFailed() throws Exception
    {
    	MockMailer.flunkSend = true;
    	for (SendResult result : mailer.send(RECIPIENTS.stream(), SUBJECT, BODY, BCC))
    	{
    		assertEquals(Mailer.SendOutcome.OTHER, result.outcome);
    		assertTrue(result.errorMessage.endsWith("Configured to fail in testing."));
    	}
    }
}
