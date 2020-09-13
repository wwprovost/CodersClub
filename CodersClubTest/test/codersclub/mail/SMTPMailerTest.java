package codersclub.mail;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNull;

import java.net.InetAddress;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.mail.PasswordAuthentication;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.dumbster.smtp.SimpleSmtpServer;
import com.dumbster.smtp.SmtpMessage;

import codersclub.mail.Mailer.SendResult;

public class SMTPMailerTest {

	public static final String HOST = "localhost";
	public static final int PORT = 8025;
	public static final String USERNAME = "username";
	public static final String PASSWORD = "password";
	public static final String SENDER = "provost@tiac.net";
	public static final String BCC = null;
	public static final String RECIPIENT = "provost@tiac.net";
	public static final List<String> RECIPIENTS = 
			Stream.of("provost@tiac.net", "provost@capcourse.com")
				.collect(Collectors.toList());
	public static final String SUBJECT = "Subject";
	public static final String BODY = "Body";
	
	private SimpleSmtpServer server;

	@Before
	public void setUp() throws Exception {
		server = SimpleSmtpServer.start(PORT);
	}

	@After
	public void tearDown() throws Exception {
		server.stop();
	}

	@Test
	public void testSend() throws Exception {
		
		SMTPMailer mailer = new SMTPMailer(HOST, PORT, SENDER);
		
		assertEquals(SENDER, mailer.getSender());
		
		Properties props = mailer.getSession().getProperties();
		assertEquals(HOST, props.get("mail.smtp.host"));
		assertEquals("" + PORT, props.get("mail.smtp.port"));
		assertNotEquals("true", props.get("mail.smtp.auth"));
		assertNotEquals("true", props.get("mail.smtp.starttls.enable"));
		
		assertNull(mailer.getSession().requestPasswordAuthentication
				(InetAddress.getByName(HOST), PORT, "smtp", "Prompt", "default user"));
		
		SendResult result = mailer.send(RECIPIENT, SUBJECT, BODY, BCC);
		assertEquals(Mailer.SendOutcome.SENT, result.outcome);
		
		List<SmtpMessage> emails = server.getReceivedEmails();
		assertEquals(1, emails.size());
		
		SmtpMessage email = emails.get(0);
		assertEquals(SUBJECT, email.getHeaderValue("Subject"));
		assertEquals(RECIPIENT, email.getHeaderValue("To"));
		assertEquals(BODY, email.getBody());
	}
	
	@Test
	public void testSendWithAuthn() throws Exception {
		
		SMTPMailer mailer = new SMTPMailer(HOST, PORT, SENDER, USERNAME, PASSWORD);
		
		assertEquals(SENDER, mailer.getSender());
		
		Properties props = mailer.getSession().getProperties();
		assertEquals(HOST, props.get("mail.smtp.host"));
		assertEquals("" + PORT, props.get("mail.smtp.port"));
		assertEquals("true", props.get("mail.smtp.auth"));
		assertNotEquals("true", props.get("mail.smtp.starttls.enable"));
		
		PasswordAuthentication authn = mailer.getSession().requestPasswordAuthentication
				(InetAddress.getByName(HOST), PORT, "smtp", "Prompt", "default user");
		assertEquals(USERNAME, authn.getUserName());
		assertEquals(PASSWORD, authn.getPassword());

		SendResult result = mailer.send(RECIPIENT, SUBJECT, BODY, BCC);
		assertEquals(Mailer.SendOutcome.SENT, result.outcome);
		
		List<SmtpMessage> emails = server.getReceivedEmails();
		assertEquals(1, emails.size());
		
		SmtpMessage email = emails.get(0);
		assertEquals(SUBJECT, email.getHeaderValue("Subject"));
		assertEquals(RECIPIENT, email.getHeaderValue("To"));
		assertEquals(BODY, email.getBody());
	}
	
	@Test(expected=IllegalArgumentException.class)
	public void testSendNoHost() throws Exception {
		new SMTPMailer(null, PORT, SENDER);
	}
	
	@Test(expected=IllegalArgumentException.class)
	public void testSendNoSender() throws Exception {
		new SMTPMailer(HOST, PORT, null);
	}
	
	@Test
	public void testSendNoRecipient() throws Exception {
		SendResult result = new SMTPMailer(HOST, PORT, SENDER).send((String) null, SUBJECT, BODY, BCC);
		assertEquals(Mailer.SendOutcome.BAD_ADDRESS, result.outcome);
	}
	
	@Test(expected=IllegalArgumentException.class)
	public void testSendNoSubject() throws Exception {
		new SMTPMailer(HOST, PORT, SENDER).send(RECIPIENT, null, BODY, BCC);
	}
	
	@Test(expected=IllegalArgumentException.class)
	public void testSendNoBody() throws Exception {
		new SMTPMailer(HOST, PORT, SENDER).send(RECIPIENT, SUBJECT, null, BCC);
	}
	
	@Test
	public void testSendToList() throws Exception {
		
		SMTPMailer mailer = new SMTPMailer(HOST, PORT, SENDER);
		
		assertEquals(SENDER, mailer.getSender());
		
		Properties props = mailer.getSession().getProperties();
		assertEquals(HOST, props.get("mail.smtp.host"));
		assertEquals("" + PORT, props.get("mail.smtp.port"));
		assertNotEquals("true", props.get("mail.smtp.auth"));
		assertNotEquals("true", props.get("mail.smtp.starttls.enable"));
		
		assertNull(mailer.getSession().requestPasswordAuthentication
				(InetAddress.getByName(HOST), PORT, "smtp", "Prompt", "default user"));
		
		List<SendResult> results = mailer.send(RECIPIENTS.stream(), SUBJECT, BODY, BCC);
		for (SendResult result : results)
			assertEquals(Mailer.SendOutcome.SENT, result.outcome);
		
		List<SmtpMessage> emails = server.getReceivedEmails();
		assertEquals(2, emails.size());
		
		for (int i = 0; i < emails.size(); ++i) {
			SmtpMessage email = emails.get(i);
			assertEquals(SUBJECT, email.getHeaderValue("Subject"));
			assertEquals(RECIPIENTS.get(i), email.getHeaderValue("To"));
			assertEquals(BODY, email.getBody());
		}
	}
	
	@Test
	public void testSendToListWithAuthn() throws Exception {
		
		SMTPMailer mailer = new SMTPMailer(HOST, PORT, SENDER, USERNAME, PASSWORD);
		
		assertEquals(SENDER, mailer.getSender());
		
		Properties props = mailer.getSession().getProperties();
		assertEquals(HOST, props.get("mail.smtp.host"));
		assertEquals("" + PORT, props.get("mail.smtp.port"));
		assertEquals("true", props.get("mail.smtp.auth"));
		assertNotEquals("true", props.get("mail.smtp.starttls.enable"));
		
		PasswordAuthentication authn = mailer.getSession().requestPasswordAuthentication
				(InetAddress.getByName(HOST), PORT, "smtp", "Prompt", "default user");
		assertEquals(USERNAME, authn.getUserName());
		assertEquals(PASSWORD, authn.getPassword());
		
		List<SendResult> results = mailer.send(RECIPIENTS.stream(), SUBJECT, BODY, BCC);
		for (SendResult result : results)
			assertEquals(Mailer.SendOutcome.SENT, result.outcome);
		
		List<SmtpMessage> emails = server.getReceivedEmails();
		assertEquals(2, emails.size());
		
		for (int i = 0; i < emails.size(); ++i) {
			SmtpMessage email = emails.get(i);
			assertEquals(SUBJECT, email.getHeaderValue("Subject"));
			assertEquals(RECIPIENTS.get(i), email.getHeaderValue("To"));
			assertEquals(BODY, email.getBody());
		}
	}
	
	@Test
	public void testSendToListWithDuplicates() throws Exception {
		
		SMTPMailer mailer = new SMTPMailer(HOST, PORT, SENDER);
		
		assertEquals(SENDER, mailer.getSender());
		
		Properties props = mailer.getSession().getProperties();
		assertEquals(HOST, props.get("mail.smtp.host"));
		assertEquals("" + PORT, props.get("mail.smtp.port"));
		assertNotEquals("true", props.get("mail.smtp.auth"));
		assertNotEquals("true", props.get("mail.smtp.starttls.enable"));
		
		assertNull(mailer.getSession().requestPasswordAuthentication
				(InetAddress.getByName(HOST), PORT, "smtp", "Prompt", "default user"));
		
		Stream<String> dups = Stream.of("provost@tiac.net", "szelbow@gmail.com",
				"provost@tiac.net", "me@me.com", "szelbow@gmail.com");
		List<SendResult> results = mailer.send(dups, SUBJECT, BODY, BCC);
		for (SendResult result : results)
			assertEquals(Mailer.SendOutcome.SENT, result.outcome);
		
		List<SmtpMessage> emails = server.getReceivedEmails();
		assertEquals(3, emails.size());
		
		for (int i = 0; i < emails.size(); ++i) {
			SmtpMessage email = emails.get(i);
			assertEquals(SUBJECT, email.getHeaderValue("Subject"));
			assertEquals(BODY, email.getBody());
		}
	}
	
	@Test(expected=IllegalArgumentException.class)
	public void testSendToListNoRecipients() throws Exception {
		new SMTPMailer(HOST, PORT, SENDER).send((Stream<String>) null, SUBJECT, BODY, BCC);
	}
	
	@Test
	public void testSendToListIncludesNullRecipient() throws Exception {
		
		SMTPMailer mailer = new SMTPMailer(HOST, PORT, SENDER, USERNAME, PASSWORD);
		
		assertEquals(SENDER, mailer.getSender());
		
		Properties props = mailer.getSession().getProperties();
		assertEquals(HOST, props.get("mail.smtp.host"));
		assertEquals("" + PORT, props.get("mail.smtp.port"));
		assertEquals("true", props.get("mail.smtp.auth"));
		assertNotEquals("true", props.get("mail.smtp.starttls.enable"));
		
		PasswordAuthentication authn = mailer.getSession().requestPasswordAuthentication
				(InetAddress.getByName(HOST), PORT, "smtp", "Prompt", "default user");
		assertEquals(USERNAME, authn.getUserName());
		assertEquals(PASSWORD, authn.getPassword());
		
    	String[] nullAddress = { null };
		List<SendResult> results = mailer.send
				(Stream.concat(RECIPIENTS.stream(), Stream.of(nullAddress)), 
						SUBJECT, BODY, BCC);
		assertEquals(Mailer.SendOutcome.SENT, results.get(0).outcome);
		assertEquals(Mailer.SendOutcome.SENT, results.get(1).outcome);
		assertEquals(Mailer.SendOutcome.BAD_ADDRESS, results.get(2).outcome);
		
		List<SmtpMessage> emails = server.getReceivedEmails();
		assertEquals(2, emails.size());
		
		for (int i = 0; i < emails.size(); ++i) {
			SmtpMessage email = emails.get(i);
			assertEquals(SUBJECT, email.getHeaderValue("Subject"));
			assertEquals(RECIPIENTS.get(i), email.getHeaderValue("To"));
			assertEquals(BODY, email.getBody());
		}
	}
	
	@Test(expected=IllegalArgumentException.class)
	public void testSendToListNoSubject() throws Exception {
		new SMTPMailer(HOST, PORT, SENDER).send(RECIPIENTS.stream(), null, BODY, BCC);
	}
	
	@Test(expected=IllegalArgumentException.class)
	public void testSendToListNoBody() throws Exception {
		new SMTPMailer(HOST, PORT, SENDER).send(RECIPIENTS.stream(), SUBJECT, null, BCC);
	}
	
	//bad address
	//bad authn
	//other send failure
	//TODO STARTTLS
	//TODO TLS
}
