package codersclub.mail;

import java.util.List;
import java.util.stream.Stream;

public interface Mailer
{
    public enum TransportSecurity { NONE, STARTTLS, TLS };

    enum SendOutcome { SENT, NO_CREDENTIALS, AUTHENTICATION_FAILED, BAD_ADDRESS, OTHER }

	class SendResult
	{
		public String recipient;
		public SendOutcome outcome;
		public String errorMessage;
	}

	public SendResult send (String recipient, 
			String subject, String body, String BCC);
    public List<SendResult> send (Stream<String> recipients, 
    		String subject, String body, String BCC);
} 
