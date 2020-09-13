package codersclub.mail;

import static org.junit.Assert.assertEquals;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.junit.Ignore;
import org.junit.Test;

import codersclub.mail.Mailer.SendOutcome;
import codersclub.mail.Mailer.SendResult;

public class SMTPMailerFunctionalTest {

	public static final String HOST = "smtpauth.earthlink.net";
	public static final int PORT = 587;
	public static final String USERNAME = "codersclub@tiac.net";
	public static final String PASSWORD = "desarr0ll0";
	public static final String SENDER = "codersclub@tiac.net";
	public static final String BCC = "provost@capcourse.com";
	public static final String RECIPIENT = "provost@tiac.net";
	public static final List<String> RECIPIENTS = 
			Stream.of("provost@tiac.net", "provost@capcourse.com")
				.collect(Collectors.toList());
	public static final String SUBJECT = "Subject";
	public static final String BODY = "Body";
	
	@Test
	public void testSend() throws Exception {
		
		SMTPMailer mailer = new SMTPMailer(HOST, PORT, SENDER, USERNAME, PASSWORD);
		SendResult result = mailer.send(RECIPIENT, SUBJECT, BODY, BCC);
		assertEquals(SendOutcome.SENT, result.outcome);
	}

	@Ignore @Test
	public void testSendBadAddress() throws Exception {
		
		SMTPMailer mailer = new SMTPMailer(HOST, PORT, SENDER, USERNAME, PASSWORD);
		SendResult result = mailer.send("NotAValidAddress", SUBJECT, BODY, BCC);
		assertEquals(SendOutcome.OTHER, result.outcome);
	}
	
	@Ignore @Test
	public void testSendToList() throws Exception {
		
		SMTPMailer mailer = new SMTPMailer(HOST, PORT, SENDER, USERNAME, PASSWORD);
		for (SendResult result : mailer.send(RECIPIENTS.stream(), SUBJECT, BODY, null))
			assertEquals(SendOutcome.SENT, result.outcome);
	}
}
