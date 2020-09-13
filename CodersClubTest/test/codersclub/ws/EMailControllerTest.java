package codersclub.ws;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.net.InetAddress;
import java.util.List;
import java.util.Properties;

import javax.mail.PasswordAuthentication;
import javax.persistence.EntityManagerFactory;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.AuthnTest;
import codersclub.Club;
import codersclub.ClubServiceTest;
import codersclub.EMailConfig;
import codersclub.db.JPAService;
import codersclub.ex.NotInYourClub;
import codersclub.mail.Mailer;
import codersclub.mail.Mailer.SendResult;
import codersclub.mail.MockMailer;
import codersclub.mail.SMTPMailer;
import codersclub.ws.EMailController.ConfigAndPasswordStatus;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=WSTestConfig.class)
public class EMailControllerTest
{
	public static final String USERNAME_PIERCE_COACH = "1_Will_Provost";
	public static final String USERNAME_LAWRENCE_COACH = "2_Harold_Price";
	public static final String USERNAME_DEVO_COACH = "3_Phil_Durbin";
	
	public static final String EMAIL_PASSWORD_ATTR = "emailPassword";
	public static final String PASSWORD = "password";
	
	public static final int CODER_ID = 1;
	public static final String PARENT_EMAIL = "parent1@gmail.com";
	
	public static final int STAFF_ID = 3;
	public static final String STAFF_EMAIL = "int";
	
	@Autowired
    private EMailController controller;
    
    @Autowired
    private EntityManagerFactory emf;
    
    @Autowired
    private JPAService<Club> clubService;
    
    private EMailController.Message messageToSend;
    
    @Before
    public void setUp()
    {
    	messageToSend = new EMailController.Message();
    	messageToSend.subject = "Subject";
    	messageToSend.body = "Body";

    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	AuthnTest.setSessionAttribute(EMAIL_PASSWORD_ATTR, PASSWORD);
    	
    	controller.setDestination(EMailController.Destination.MOCK);
    	MockMailer.messages.clear();
    	MockMailer.flunkAddress = false;
    	MockMailer.flunkAuthentication = false;
    	MockMailer.flunkSend = false;
    }
    
    @Test
    public void testGetEMailConfig()
    {
    	EMailConfig config = controller.getConfig();
    	ClubServiceTest.assertExistingConfig(config, 587);
    }
    
    @Test
    public void testUpdateEMailConfig()
    {
    	try
    	{
	    	AuthnTest.sessionAttributes.clear();

	    	ConfigAndPasswordStatus configPlus = controller.getConfig();
	    	assertFalse(configPlus.passwordSet);

	    	EMailConfig config = configPlus.toConfig();
	    	config.setPort(8025);
	    	config = controller.setConfig(config);
	    	ClubServiceTest.assertExistingConfig(config, 8025);
	
	    	emf.getCache().evict(Club.class);
	    	emf.getCache().evict(EMailConfig.class);
	    	config = clubService.getByID(1).getEMailConfig();
	    	ClubServiceTest.assertExistingConfig(config, 8025);
    	}
    	finally
    	{
    		ClubServiceTest.resetEMailConfig(emf);
    	}
    }
    
    @Test
    public void testUpdateEMailConfigWithPasswordSet()
    {
    	try
    	{
	    	ConfigAndPasswordStatus configPlus = controller.getConfig();
	    	assertTrue(configPlus.passwordSet);

	    	EMailConfig config = configPlus.toConfig();
	    	config.setPort(8025);
	    	config = controller.setConfig(config);
	    	ClubServiceTest.assertExistingConfig(config, 8025);
	
	    	emf.getCache().evict(Club.class);
	    	emf.getCache().evict(EMailConfig.class);
	    	config = clubService.getByID(1).getEMailConfig();
	    	ClubServiceTest.assertExistingConfig(config, 8025);
    	}
    	finally
    	{
    		ClubServiceTest.resetEMailConfig(emf);
    	}
    }
    
    @Test(expected=NotInYourClub.class)
    public void testUpdateEMailConfigWrongClub()
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
    	EMailConfig config = clubService.getByID(1).getEMailConfig();
    	config = controller.setConfig(config);
    }
    
    @Test
    public void testCreateEMailConfig()
    {
    	
    	try
    	{
        	AuthnTest.username = USERNAME_LAWRENCE_COACH;
	    	EMailConfig config = ClubServiceTest.createEMailConfig();
	    	config = controller.setConfig(config);
	    	assertNotEquals(0, config.getID());
	    	ClubServiceTest.assertNewConfig(config);
	
	    	emf.getCache().evict(Club.class);
	    	emf.getCache().evict(EMailConfig.class);
	    	config = clubService.getByID(2).getEMailConfig();
	    	ClubServiceTest.assertNewConfig(config);
    	}
    	finally
    	{
    		ClubServiceTest.removeEMailConfig(emf);
    	}
    }
    
    @Test
    public void testSMTPDestination()
    	throws Exception
    {
    	controller.setDestination(EMailController.Destination.SMTP);
    	controller.setPassword(PASSWORD);
    	Mailer mailer = controller.createMailer();
    	assertTrue(mailer instanceof SMTPMailer);
    	
    	SMTPMailer smtpMailer = (SMTPMailer) mailer;
    	Properties props = smtpMailer.getSession().getProperties();
    	assertEquals("smtpauth.earthlink.net", props.get("mail.smtp.host"));
    	assertEquals("587", props.get("mail.smtp.port"));
    	assertEquals("provost@tiac.net", smtpMailer.getSender());

    	assertEquals("true", props.get("mail.smtp.auth"));
		assertNotEquals("true", props.get("mail.smtp.starttls.enable"));

		byte[] dummyAddress = { -64, -32, 0, 1 };
		PasswordAuthentication authn = smtpMailer.getSession().requestPasswordAuthentication
				(InetAddress.getByAddress("smtpauth.earthlink.net", dummyAddress), 
						587, "smtp", "Prompt", "default user");
		assertEquals("provost@tiac.net", authn.getUserName());
		assertEquals(PASSWORD, authn.getPassword());
    }
    
    @Test
    public void testMockDestination()
    	throws Exception
    {
    	controller.setPassword(PASSWORD);
    	Mailer mailer = controller.createMailer();
    	assertTrue(mailer instanceof MockMailer);
    	
    	MockMailer mockMailer = (MockMailer) mailer;
    	assertEquals("smtpauth.earthlink.net", mockMailer.getHost());
    	assertEquals(587, mockMailer.getPort());
    	assertEquals("provost@tiac.net", mockMailer.getSender());
    }
    
    @Test
    public void testGetPassword()
    {
    	assertEquals(PASSWORD, controller.getPassword());
    }
    
    @Test
    public void testSetPassword()
    {
    	AuthnTest.sessionAttributes.clear();
    	controller.setPassword("somethingNew");
    	assertEquals("somethingNew", AuthnTest.session.getAttribute(EMAIL_PASSWORD_ATTR));
    }
    
    @Test
    public void testSendToCoder()
    {
    	ResponseEntity<SendResult> response = 
    			controller.sendEMailToCoder(CODER_ID, messageToSend);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	SendResult result = response.getBody();
    	
    	assertEquals(Mailer.SendOutcome.SENT, result.outcome);
    	assertNull(result.errorMessage);
    	
    	assertEquals(1, MockMailer.messages.size());
    	MockMailer.Message messageSent = MockMailer.messages.get(0);
    	assertEquals(PARENT_EMAIL, messageSent.getRecipient());
    	assertEquals(messageToSend.subject, messageSent.getSubject());
    	assertEquals(messageToSend.body, messageSent.getBody());
    }

    @Test
    public void testSendToCoderWithBCC()
    {
    	messageToSend.BCC = "myself@me.com"; 
    	// ... though there's no way to "see" the resulting BCC, so no change in outcomes
    	
    	ResponseEntity<SendResult> response = 
    			controller.sendEMailToCoder(CODER_ID, messageToSend);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	SendResult result = response.getBody();
    	
    	assertEquals(Mailer.SendOutcome.SENT, result.outcome);
    	assertNull(result.errorMessage);
    	
    	assertEquals(1, MockMailer.messages.size());
    	MockMailer.Message messageSent = MockMailer.messages.get(0);
    	assertEquals(PARENT_EMAIL, messageSent.getRecipient());
    	assertEquals(messageToSend.subject, messageSent.getSubject());
    	assertEquals(messageToSend.body, messageSent.getBody());
    }

    @Test(expected=NotInYourClub.class)
    public void testSendToCoderNotInClub()
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
    	controller.sendEMailToCoder(CODER_ID, messageToSend);
    }
    
    @Test
    public void testSendToCoderNoPasswordSet()
    {
    	AuthnTest.sessionAttributes.clear();
    	ResponseEntity<SendResult> response = 
    			controller.sendEMailToCoder(CODER_ID, messageToSend);
    	SendResult result = response.getBody();
    	
    	assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    	assertEquals(Mailer.SendOutcome.NO_CREDENTIALS, result.outcome);
    }

    @Test
    public void testSendToCoderBadAddress()
    {
    	MockMailer.flunkAddress = true;
    	ResponseEntity<SendResult> response = 
    			controller.sendEMailToCoder(CODER_ID, messageToSend);
    	SendResult result = response.getBody();
    	
    	assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    	assertEquals(Mailer.SendOutcome.BAD_ADDRESS, result.outcome);
    }

    @Test
    public void testSendToCoderBadAuthentication()
    {
    	MockMailer.flunkAuthentication = true;
    	ResponseEntity<SendResult> response = 
    			controller.sendEMailToCoder(CODER_ID, messageToSend);
    	SendResult result = response.getBody();
    	
    	assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    	assertEquals(Mailer.SendOutcome.AUTHENTICATION_FAILED, result.outcome);
    	assertNull(AuthnTest.session.getAttribute(EMAIL_PASSWORD_ATTR));
    }

    @Test
    public void testSendToCoderSendFailed()
    {
    	MockMailer.flunkSend = true;
    	ResponseEntity<SendResult> response = 
    			controller.sendEMailToCoder(CODER_ID, messageToSend);
    	SendResult result = response.getBody();
    	
    	assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    	assertEquals(Mailer.SendOutcome.OTHER, result.outcome);
    	assertTrue(result.errorMessage.endsWith("Configured to fail in testing."));
    }

    @Test
    public void testSendToGroup()
    {
    	ResponseEntity<List<SendResult>> response = 
    			controller.sendEMailToGroup("Group 1", messageToSend);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	List<SendResult> results = response.getBody();
    	
    	assertEquals(2, results.size());
    	for (SendResult result : results)
    	{
    		assertEquals(Mailer.SendOutcome.SENT, result.outcome);
    		assertNull(result.errorMessage);
    	}
    	
    	assertEquals(2, MockMailer.messages.size());
    	for (MockMailer.Message messageSent : MockMailer.messages)
    	{
	    	assertEquals(messageToSend.subject, messageSent.getSubject());
	    	assertEquals(messageToSend.body, messageSent.getBody());
    	}
    }

    @Test
    public void testSendToGroupWithBCC()
    {
    	messageToSend.BCC = "myself@me.com";
    	
    	ResponseEntity<List<SendResult>> response = 
    			controller.sendEMailToGroup("Group 1", messageToSend);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	List<SendResult> results = response.getBody();
    	
    	assertEquals(3, results.size());
    	for (SendResult result : results)
    	{
    		assertEquals(Mailer.SendOutcome.SENT, result.outcome);
    		assertNull(result.errorMessage);
    	}
    	
    	assertEquals(3, MockMailer.messages.size());
    	assertEquals(messageToSend.subject, MockMailer.messages.get(0).getSubject());
    	assertEquals(messageToSend.body, MockMailer.messages.get(0).getBody());
    	assertEquals(messageToSend.subject, MockMailer.messages.get(1).getSubject());
    	assertEquals(messageToSend.body, MockMailer.messages.get(1).getBody());
    	assertEquals("Coders' Club message sent", MockMailer.messages.get(2).getSubject());
    	System.out.println(MockMailer.messages.get(2).getBody());
    }

    @Test
    public void testSendToGroupNoPasswordSet()
    {
    	AuthnTest.sessionAttributes.clear();
    	ResponseEntity<List<SendResult>> response = 
    			controller.sendEMailToGroup("Group 1", messageToSend);
    	assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    	List<SendResult> results = response.getBody();
    	
    	assertEquals(1, results.size());
   		assertEquals(Mailer.SendOutcome.NO_CREDENTIALS, results.get(0).outcome);
    	
    	assertEquals(0, MockMailer.messages.size());
    }

    @Test
    public void testSendToGroupBadAuthentication()
    {
    	MockMailer.flunkAuthentication = true;
    	ResponseEntity<List<SendResult>> response = 
    			controller.sendEMailToGroup("Group 1", messageToSend);
    	assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    	List<SendResult> results = response.getBody();
    	
    	assertEquals(1, results.size());
   		assertEquals(Mailer.SendOutcome.AUTHENTICATION_FAILED, results.get(0).outcome);
    	
    	assertEquals(0, MockMailer.messages.size());
    }

    @Test
    public void testSendToActive()
    {
    	ResponseEntity<List<SendResult>> response = 
    			controller.sendEMailToActiveCoders(messageToSend);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	List<SendResult> results = response.getBody();

    	assertEquals(4, results.size());
    	for (SendResult result : results)
    	{
    		assertEquals(Mailer.SendOutcome.SENT, result.outcome);
    		assertNull(result.errorMessage);
    	}
    	
    	assertEquals(4, MockMailer.messages.size());
    	for (MockMailer.Message messageSent : MockMailer.messages)
    	{
	    	assertEquals(messageToSend.subject, messageSent.getSubject());
	    	assertEquals(messageToSend.body, messageSent.getBody());
    	}
    }

    @Test
    public void testSendToAllCoders()
    {
    	ResponseEntity<List<SendResult>> response = 
    			controller.sendEMailToAllCoders(messageToSend);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	List<SendResult> results = response.getBody();

    	assertEquals(4, results.size());
    	for (SendResult result : results)
    	{
    		assertEquals(Mailer.SendOutcome.SENT, result.outcome);
    		assertNull(result.errorMessage);
    	}
    	
    	assertEquals(4, MockMailer.messages.size());
    	for (MockMailer.Message messageSent : MockMailer.messages)
    	{
	    	assertEquals(messageToSend.subject, messageSent.getSubject());
	    	assertEquals(messageToSend.body, messageSent.getBody());
    	}
    }
    
    //TODO send to group/active/all with one address bad? tough to mock this
    
    @Test
    public void testSendToStaffer()
    {
    	ResponseEntity<SendResult> response = 
    			controller.sendEMailToStaffer(STAFF_ID, messageToSend);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	SendResult result = response.getBody();
    	
    	assertEquals(Mailer.SendOutcome.SENT, result.outcome);
    	assertNull(result.errorMessage);
    	
    	assertEquals(1, MockMailer.messages.size());
    	MockMailer.Message messageSent = MockMailer.messages.get(0);
    	assertEquals(STAFF_EMAIL, messageSent.getRecipient());
    	assertEquals(messageToSend.subject, messageSent.getSubject());
    	assertEquals(messageToSend.body, messageSent.getBody());
    }

    @Test(expected=NotInYourClub.class)
    public void testSendToStafferNotInClub()
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
    	controller.sendEMailToStaffer(STAFF_ID, messageToSend);
    }

    @Test
    public void testSendToAllCoaches()
    {
    	ResponseEntity<List<SendResult>> response = 
    			controller.sendEMailToCoaches(messageToSend);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	List<SendResult> results = response.getBody();

    	assertEquals(3, results.size());
    	for (SendResult result : results)
    	{
    		assertEquals(Mailer.SendOutcome.SENT, result.outcome);
    		assertNull(result.errorMessage);
    	}
    	
    	assertEquals(3, MockMailer.messages.size());
    	for (MockMailer.Message messageSent : MockMailer.messages)
    	{
	    	assertEquals(messageToSend.subject, messageSent.getSubject());
	    	assertEquals(messageToSend.body, messageSent.getBody());
    	}
    }

    @Test
    public void testSendToAllAdmins()
    {
    	ResponseEntity<List<SendResult>> response = 
    			controller.sendEMailToAdmins(messageToSend);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	List<SendResult> results = response.getBody();

    	assertEquals(3, results.size());
    	for (SendResult result : results)
    	{
    		assertEquals(Mailer.SendOutcome.SENT, result.outcome);
    		assertNull(result.errorMessage);
    	}
    	
    	assertEquals(3, MockMailer.messages.size());
    	for (MockMailer.Message messageSent : MockMailer.messages)
    	{
	    	assertEquals(messageToSend.subject, messageSent.getSubject());
	    	assertEquals(messageToSend.body, messageSent.getBody());
    	}
    }

    @Test
    public void testSendToAllStaff()
    {
    	ResponseEntity<List<SendResult>> response = 
    			controller.sendEMailToAllStaff(messageToSend);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	List<SendResult> results = response.getBody();

    	assertEquals(4, results.size());
    	for (SendResult result : results)
    	{
    		assertEquals(Mailer.SendOutcome.SENT, result.outcome);
    		assertNull(result.errorMessage);
    	}
    	
    	assertEquals(4, MockMailer.messages.size());
    	for (MockMailer.Message messageSent : MockMailer.messages)
    	{
	    	assertEquals(messageToSend.subject, messageSent.getSubject());
	    	assertEquals(messageToSend.body, messageSent.getBody());
    	}
    }
}
