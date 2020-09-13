package codersclub.ws;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Stream;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import codersclub.Authn;
import codersclub.Club;
import codersclub.ClubService;
import codersclub.Coder;
import codersclub.CoderService;
import codersclub.EMailConfig;
import codersclub.Staff;
import codersclub.StaffService;
import codersclub.ex.NotInYourClub;
import codersclub.mail.Mailer;
import codersclub.mail.Mailer.SendOutcome;
import codersclub.mail.Mailer.SendResult;
import codersclub.mail.MockMailer;
import codersclub.mail.SMTPMailer;

@RestController
@RequestMapping("/EMail")
public class EMailController
{
	public enum Destination { SMTP, FILE, MOCK };

	public static class ConfigAndPasswordStatus
		extends EMailConfig
	{
		public boolean passwordSet;
		
		public ConfigAndPasswordStatus(EMailConfig config, boolean passwordSet)
		{
			this.setID(config.getID());
			this.setHost(config.getHost());
			this.setPort(config.getPort());
			this.setSender(config.getSender());
			this.setUsername(config.getUsername());
			this.setTransportSecurity(config.getTransportSecurity());
			
			this.passwordSet = passwordSet;
		}
		
		public EMailConfig toConfig()
		{
			EMailConfig result = new EMailConfig(getHost(), getPort(), getSender(), 
					getUsername(), getTransportSecurity());
			result.setID(getID());
			return result;
		}
	}
	
	public static class Message
	{
		public String subject;
		public String body;
		public String BCC;
	}
	
	private static final Logger LOG = 
			Logger.getLogger(EMailController.class.getName());
	
    private static final String EMAIL_PASSWORD_ATTR = "emailPassword";
    
	@Autowired
	private Authn authn;
	
	@Autowired
	private ClubService clubService;
	
    @Autowired
    private CoderService coderService;
    
    @Autowired
    private StaffService staffService;
    
    @Autowired
    private HttpSession session;

    private Destination destination = Destination.SMTP;
    
    private Coder getCoderInOurClub(int ID)
    {
    	Club club = authn.getLoggedInUser().getClub();
    	Coder coder = coderService.getByID(ID);
    	if (coder.getClub().getID() != club.getID())
    		throw new NotInYourClub();
    	
    	return coder;
    }

    private Staff getStaffInOurClub(int ID)
    {
    	Club club = authn.getLoggedInUser().getClub();
    	Staff staffer = staffService.getByID(ID);
    	if (staffer.getClub().getID() != club.getID())
    		throw new NotInYourClub();
    	
    	return staffer;
    }

    public void setDestination(Destination destination)
    {
    	if (destination == Destination.SMTP)
    	{
    		LOG.info("Configured to send real e-mail via SMTP.");
    	}
    	else if (destination == Destination.MOCK)
    	{
    		LOG.info("Configured to send mock e-mail.");
    	}
    	else
    		throw new IllegalStateException("We don't support spooling email to a local file just yet.");

    	this.destination = destination;
    }
    
    public Mailer createMailer()
    {
    	EMailConfig config = getConfig();
    	if (destination == Destination.SMTP)
    	{
    		return new SMTPMailer(config.getHost(), config.getPort(), config.getSender(),
    				config.getTransportSecurity(), config.getUsername(), getPassword());
    	}
    	else if (destination == Destination.MOCK)
    	{
    		return new MockMailer(config.getHost(), config.getPort(), config.getSender());
    	}
    	else
    		throw new IllegalStateException("We don't support spooling email to a local file just yet.");
    }

    public String getPassword()
    {
    	return (String) session.getAttribute(EMAIL_PASSWORD_ATTR);
    }
    
    @RequestMapping(value="Password", method=RequestMethod.PUT)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setPassword(@RequestBody String emailPassword)
    {
    	session.setAttribute(EMAIL_PASSWORD_ATTR, emailPassword);
    }
    
    @RequestMapping(value="Config", method=RequestMethod.GET)
    public ConfigAndPasswordStatus getConfig()
    {
    	return new ConfigAndPasswordStatus
    			(authn.getLoggedInUser().getClub().getEMailConfig(),
    					getPassword() != null);
    }

    @RequestMapping(value="Config", method=RequestMethod.PUT)
    public EMailConfig setConfig(@RequestBody EMailConfig config)
    {
    	Club club = authn.getLoggedInUser().getClub();
    	return clubService.setEMailConfig(club, config);
    }
    
    private ResponseEntity<SendResult> sendEMail(String recipient, Message message)
    {
    	SendResult result = new SendResult();
    	
    	EMailConfig config = getConfig();
    	if (config.getUsername() != null && getPassword() == null)
    	{
    		result.outcome = Mailer.SendOutcome.NO_CREDENTIALS;
    		result.errorMessage = "You must set the user's SMTP password before invoking this operation.";
    		return new ResponseEntity<>(result, HttpStatus.UNAUTHORIZED);
    	}
    	
    	Mailer mailer = createMailer();
    	result = mailer.send(recipient, message.subject, message.body, message.BCC);
    	if (result.outcome == SendOutcome.AUTHENTICATION_FAILED)
    	{
    		session.removeAttribute(EMAIL_PASSWORD_ATTR);
    		return new ResponseEntity<>(result, HttpStatus.UNAUTHORIZED);
    	}
    	
    	if (result.outcome == Mailer.SendOutcome.BAD_ADDRESS)
    		return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
    	
    	if (result.outcome == Mailer.SendOutcome.OTHER)
    		return new ResponseEntity<>(result, HttpStatus.INTERNAL_SERVER_ERROR);
 
    	return new ResponseEntity<>(result, HttpStatus.OK);
     }
    
    private ResponseEntity<List<SendResult>> sendEMail(Stream<String> recipients, Message message)
    {
    	List<SendResult> results = new ArrayList<>();
    	
    	EMailConfig config = getConfig();
    	if (config.getUsername() != null && getPassword() == null)
    	{
    		SendResult result = new SendResult();
    		result.outcome = Mailer.SendOutcome.NO_CREDENTIALS;
    		result.errorMessage = "You must set the user's SMTP password before invoking this operation.";
    		results.add(result);
    		return new ResponseEntity<>(results, HttpStatus.UNAUTHORIZED);
    	}
    	
    	Mailer mailer = createMailer();
    	results = mailer.send(recipients, message.subject, message.body, message.BCC);
    	if (results.size() != 0 && 
    			results.get(0).outcome == SendOutcome.AUTHENTICATION_FAILED)
    		session.removeAttribute(EMAIL_PASSWORD_ATTR);

    	Optional<SendOutcome> badOutcome = results.stream()
    			.map(result -> result.outcome)
    			.filter(outcome -> outcome != SendOutcome.SENT)
    			.findFirst();
    	HttpStatus status = badOutcome.isPresent() && 
    			badOutcome.get() == SendOutcome.AUTHENTICATION_FAILED 
    					? HttpStatus.UNAUTHORIZED
    					: HttpStatus.OK;
    			
    	return new ResponseEntity<>(results, status);
     }
    
    @RequestMapping(value="Coders/{ID}", method=RequestMethod.POST)
    public ResponseEntity<SendResult> sendEMailToCoder
    (@PathVariable("ID") int coderID, @RequestBody Message message)
    {
    	return sendEMail(getCoderInOurClub(coderID).getParentEMail(), message);
    }

    @RequestMapping(value="Coders", method=RequestMethod.POST, params="group")
    public ResponseEntity<List<SendResult>> sendEMailToGroup
    (@RequestParam("group") String groupID, @RequestBody Message message)
    {
    	List<Coder> coders = coderService.getGroupOfCoders
    			(authn.getLoggedInUser().getClub(), groupID);
    	
    	return sendEMail(coders.stream().map(coder -> coder.getParentEMail()), message);
    }

    @RequestMapping(value="Coders", method=RequestMethod.POST, params="active")
    public ResponseEntity<List<SendResult>> sendEMailToActiveCoders(@RequestBody Message message)
    {
    	List<Coder> coders = coderService.getAllByClub(authn.getLoggedInUser().getClub());
    	
    	return sendEMail(coders.stream()
    			.filter(coder -> coder.getGroup() != null)
    			.map(coder -> coder.getParentEMail()), message);
    }

    @RequestMapping(value="Coders", method=RequestMethod.POST)
    public ResponseEntity<List<SendResult>> sendEMailToAllCoders(@RequestBody Message message)
    {
    	List<Coder> coders = coderService.getAllByClub(authn.getLoggedInUser().getClub());
    	
    	Date now = new Date();
    	return sendEMail(coders.stream()
    			.filter(coder -> coder.getGraduation() == null || 
    					coder.getGraduation().after(now))
    			.map(coder -> coder.getParentEMail()), message);
    }

    @RequestMapping(value="Staff/{ID}", method=RequestMethod.POST)
    public ResponseEntity<SendResult> sendEMailToStaffer(@PathVariable("ID") int staffID, Message message)
    {
    	return sendEMail(getStaffInOurClub(staffID).getEMail(), message);
    }

    @RequestMapping(value="Staff", method=RequestMethod.POST, params="coach")
    public ResponseEntity<List<SendResult>> sendEMailToCoaches(@RequestBody Message message)
    {
    	List<Staff> coaches = staffService.getAllCoaches
    			(authn.getLoggedInUser().getClub());
    	System.out.println("Sending email to " + coaches.size() + " coaches.");
    	
    	return sendEMail(coaches.stream().map(coach -> coach.getEMail()), message);
    }

    @RequestMapping(value="Staff", method=RequestMethod.POST, params="admin")
    public ResponseEntity<List<SendResult>> sendEMailToAdmins(@RequestBody Message message)
    {
    	List<Staff> admins = staffService.getAllAdmins
    			(authn.getLoggedInUser().getClub());
    	
    	return sendEMail(admins.stream().map(admin -> admin.getEMail()), message);
    }

    @RequestMapping(value="Staff", method=RequestMethod.POST)
    public ResponseEntity<List<SendResult>> sendEMailToAllStaff(@RequestBody Message message)
    {
    	List<Staff> staff = staffService.getAllByClub(authn.getLoggedInUser().getClub());
    	
    	return sendEMail(staff.stream().map(staffer -> staffer.getEMail()), message);
    }
}
  