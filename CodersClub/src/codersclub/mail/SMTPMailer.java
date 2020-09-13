package codersclub.mail;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Properties;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.mail.AuthenticationFailedException;
import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class SMTPMailer
	implements Mailer
{
    private static final Logger LOG = Logger.getLogger(SMTPMailer.class.getName());
    
    private String sender;
    private Session session;

    private static class CrudeAuthenticator
    	extends Authenticator
	{
    	private String username;
    	private String password;
    	
    	public CrudeAuthenticator (String username, String password)
    	{
    		this.username = username;
    		this.password = password;
    	}
    	
	    public PasswordAuthentication getPasswordAuthentication ()
	    {
	        return new PasswordAuthentication(username, password);
	    }
	}

    private static void require(String label, String value)
    {
    	if (value == null || value == "")
    		throw new IllegalArgumentException(label + " is required.");
    }
    
    public SMTPMailer (String host, int port, String sender)
    {
        this (host, port, sender, TransportSecurity.NONE);
    }
    
    public SMTPMailer (String host, int port, String sender, String username, String password)
    {
        this (host, port, sender, TransportSecurity.NONE, username, password);
    }
    
    public SMTPMailer (String host, int port, String sender, TransportSecurity transportSecurity)
    {
    	this (host, port, sender, transportSecurity, null, null);
    }
    
    public SMTPMailer (String host, int port, String sender, 
    		TransportSecurity transportSecurity, String username, String password)
    {
    	require("SMTP host", host);
    	require("Sender address", sender);
    	
        this.sender = sender;
        
        Properties props = new Properties();
        props.put ("mail.smtp.host", host);
        props.put ("mail.smtp.port", "" + port);
        
        if (transportSecurity == TransportSecurity.STARTTLS)
        {
        	props.put("mail.smtp.starttls.enable", "true");
        }
        else if (transportSecurity == TransportSecurity.TLS)
        {
        	LOG.severe("TLS not yet supported.");
        	throw new UnsupportedOperationException("TLS not yet supported");
        }
        
        if (username != null && password != null)
        {
        	props.put ("mail.smtp.auth", "true");
        	session = Session.getInstance (props, 
        			new CrudeAuthenticator (username, password));
        }
        else
        {
        	session = Session.getInstance(props);
        }
    }

    public String getSender()
    {
    	return sender;
    }
    
    public Session getSession()
    {
    	return session;
    }

    public Message createMessage (String to, 
    		String subject, String body, String BCC)
    	throws AddressException, MessagingException, UnsupportedEncodingException
    {
    	require("Message recipient", to);
    	require("Message subject", subject);
    	require("Message body", body);
    	
        Message message = new MimeMessage (session); 
        message.setFrom (new InternetAddress (sender, "Coders' Club"));
        message.setRecipients 
        	(Message.RecipientType.TO, InternetAddress.parse (to, false));
        if (BCC != null)
        	message.addRecipient(Message.RecipientType.BCC, new InternetAddress(BCC, false));
        
        message.setSubject (subject);
        message.setText (body);
        message.setSentDate (new Date());

        return message;
    }
    
    public static String createSummary(String subject, String body, List<SendResult> results)
    {
    	StringBuilder summary = new StringBuilder
    		("You sent a message from the Coders' Club application:\n\n" +
    			"Subject: " + subject + "\n\n" +
    			"Body:\n\n" + body + "\n\n" +
    			"Recipients: \n");
    	for (SendResult result : results) 
    	{
    		summary.append("    ").append(result.recipient);
    		if (result.outcome != SendOutcome.SENT) 
    		{
    			summary.append(" ").append(result.outcome);
    			if (result.errorMessage != null)
    			{
    				summary.append(" \"").append(result.errorMessage)
    						.append("\"");
    			}
    		}
    		summary.append("\n");
    	}
    	
    	return summary.toString();
    }

    public SendResult send (String recipient, 
    		String subject, String body, String BCC)
    {
    	SendResult result = new SendResult();
    	result.recipient = recipient;
    	
    	if (recipient == null)
    	{
    		result.outcome = SendOutcome.BAD_ADDRESS;
    		return result;
    	}
    	
		try {
			Transport.send (createMessage (recipient, subject, body, BCC));
			result.outcome = Mailer.SendOutcome.SENT;
		} 
		catch (AddressException ex) 
		{
	        result.outcome = Mailer.SendOutcome.BAD_ADDRESS;
	        result.errorMessage = "The destination address was not accepted: " + recipient;
		}
		catch (AuthenticationFailedException ex) 
		{
	        result.outcome = Mailer.SendOutcome.AUTHENTICATION_FAILED;
	        result.errorMessage = "Username/password authentication failed.";
		}
		catch (MessagingException | UnsupportedEncodingException ex) 
		{
	        result.outcome = Mailer.SendOutcome.OTHER;
	        result.errorMessage = ex.getLocalizedMessage();
		}
		
		return result;
    }

    public List<SendResult> send (Stream<String> recipients, 
    		String subject, String body, String BCC)
    {
    	if (recipients == null)
    		throw new IllegalArgumentException ("List of recipients is required.");
    		
        List<SendResult> results = new ArrayList<>();
        for (String recipient : recipients.distinct().collect(Collectors.toList()))
        {
          SendResult result = send(recipient, subject, body, null);
          results.add(result);
          System.out.println("Sent to " + recipient + ": " + result.outcome);
          if (result.outcome == SendOutcome.AUTHENTICATION_FAILED)
        	  break;
        }
        
        if (BCC != null) 
        {
        	results.add(send(BCC, "Coders' Club message sent", 
        			createSummary(subject, body, results), null));
        }
        
        return results;
    }
}

