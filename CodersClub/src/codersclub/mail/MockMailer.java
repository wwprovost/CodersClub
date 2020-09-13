package codersclub.mail;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class MockMailer
	implements Mailer
{
	public static boolean flunkAddress = false;
	public static boolean flunkAuthentication = false;
	public static boolean flunkSend = false;
	
    public static List<Message> messages = new ArrayList<>();
    
	private static final Logger LOG =
			Logger.getLogger(MockMailer.class.getName());
	
	public static class Message
	{
		private String recipient;
		private String subject;
		private String body;
		
		public Message(String recipient, String subject, String body)
		{
			this.recipient = recipient;
			this.subject = subject;
			this.body = body;
		}
		
		public String getRecipient()
		{
			return recipient;
		}
		
		public String getSubject()
		{
			return subject;
		}
		
		public String getBody()
		{
			return body;
		}
	}
	
    private String host;
    private int port;
    private String sender;
    
    public MockMailer(String host, int port, String sender)
    {
    	this.host = host;
    	this.port = port;
    	this.sender = sender;
    	
    	LOG.info("Set up as " + sender + " for " + host + ":" + port);
    }
    
    public SendResult send (String recipient, 
    		String subject, String body, String BCC)
    {
    	SendResult result = new SendResult();
    	result.recipient = recipient;

    	if (flunkAddress || recipient == null)
    	{
	        LOG.info("Sending " + subject + " to " + recipient);
	        LOG.info("Configured to reject the destination address -- throwing AddressException ...");

    		result.outcome = Mailer.SendOutcome.BAD_ADDRESS;
    		result.errorMessage = "The destination address was not accepted: " + recipient;
    	}
    	else if (flunkAuthentication)
    	{
	        LOG.info("Sending " + subject + " to " + recipient);
	        LOG.info("Configured to fail on authentication -- throwing AuthenticationFailedException ...");

    		result.outcome = Mailer.SendOutcome.AUTHENTICATION_FAILED;
    		result.errorMessage = "Username/password authentication failed.";
    	}
    	else if (flunkSend)
    	{
	        LOG.info("Sending " + subject + " to " + recipient);
	        LOG.info("Configured to fail -- throwing MessagingException ...");
	        
    		result.outcome = Mailer.SendOutcome.OTHER;
    		result.errorMessage = "Configured to fail in testing.";
    	}
    	else
    	{
	        LOG.info("Sent " + subject + " to " + recipient);
	        LOG.fine("Message body is:\n" + body + "\n");

	        messages.add(new Message(recipient, subject, body));
	        result.outcome = Mailer.SendOutcome.SENT;
    	}
    	
    	return result;
    }

    public List<SendResult> send (Stream<String> mailingList, 
    		String subject, String body, String BCC)
    {
    	List<SendResult> results = mailingList
    			.distinct()
    			.map(recipient -> send(recipient, subject, body, BCC))
    			.collect(Collectors.toList());
    	
		if (results.size() != 0 && 
				results.get(0).outcome == SendOutcome.AUTHENTICATION_FAILED)
			results = Collections.singletonList(results.get(0));
		
        if (BCC != null && results.stream().filter(r -> r.outcome == SendOutcome.SENT)
        		.findAny().isPresent()) 
        {
        	results = new ArrayList<>(results); // make it modifiable
        	results.add(send(BCC, "Coders' Club message sent", 
        			SMTPMailer.createSummary(subject, body, results), null));
        }
        
		return results;
    }
    
    public String getHost()
    {
    	return host;
    }
    
    public int getPort()
    {
    	return port;
    }
    
    public String getSender()
    {
    	return sender;
    }
} 
