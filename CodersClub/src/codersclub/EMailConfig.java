package codersclub;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import codersclub.mail.Mailer;

@Entity
public class EMailConfig 
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID;
    
	private String host;
	private int port;
	private String sender;
	private String username;
	private Mailer.TransportSecurity transportSecurity;
	
	public EMailConfig() {}
	
	public EMailConfig(String host, int port, String sender, 
			String username, Mailer.TransportSecurity transportSecurity)
	{
		this.host = host;
		this.port = port;
		this.sender = sender;
		this.username = username;
		this.transportSecurity = transportSecurity;
	}

    public int getID ()
    {
        return ID;
    }

    public void setID (int iD)
    {
        ID = iD;
    }

    public String getHost() {
		return host;
	}

	public void setHost(String host) {
		this.host = host;
	}

	public int getPort() {
		return port;
	}

	public void setPort(int port) {
		this.port = port;
	}

	public String getSender() {
		return sender;
	}

	public void setSender(String sender) {
		this.sender = sender;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Mailer.TransportSecurity getTransportSecurity() {
		return transportSecurity;
	}

	public void setTransportSecurity(Mailer.TransportSecurity transportSecurity) {
		this.transportSecurity = transportSecurity;
	}

}
