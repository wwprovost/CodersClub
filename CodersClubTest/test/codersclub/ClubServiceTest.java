package codersclub;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.ex.NotInYourClub;
import codersclub.mail.Mailer;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=PersistenceTestConfig.class)
public class ClubServiceTest
{
	public static final String HOST = "host";
	public static final int PORT = 25;
	public static final String SENDER = "sender";
	public static final String USERNAME = "username";
	public static final Mailer.TransportSecurity TRANSPORT_SECURITY = 
			Mailer.TransportSecurity.NONE;

	public static EMailConfig createEMailConfig()
	{
		return new EMailConfig
    			(HOST, PORT, SENDER, USERNAME, TRANSPORT_SECURITY);
	}
	
    public static void assertExistingConfig(EMailConfig config, int port)
    {
    	assertEquals("smtpauth.earthlink.net", config.getHost());
    	assertEquals(port, config.getPort());
    	assertEquals("provost@tiac.net", config.getSender());
    	assertEquals("provost@tiac.net", config.getUsername());
    }
    
    public static void assertNewConfig(EMailConfig config)
    {
    	assertEquals(HOST, config.getHost());
    	assertEquals(PORT, config.getPort());
    	assertEquals(SENDER, config.getSender());
    	assertEquals(USERNAME, config.getUsername());
    	assertEquals(TRANSPORT_SECURITY, config.getTransportSecurity());
    }
    
    public static void resetEMailConfig(EntityManagerFactory emf)
    {
		EntityManager em = emf.createEntityManager();
		em.getTransaction().begin();
		em.createQuery("update EMailConfig set port=587 where ID=1")
		.executeUpdate();
		em.getTransaction().commit();
		em.close();
    }
    
    public static void removeEMailConfig(EntityManagerFactory emf)
    {
		EntityManager em = emf.createEntityManager();
		em.getTransaction().begin();
		
		em.createQuery("update Club set emailConfig = null where ID = 2")
			.executeUpdate();
		em.getTransaction().commit();
		em.close();
    }
    
	private Club pierce;
    private Club lawrence;
    private Club devo;
    
    @Autowired
    private ClubService clubService;
    
    @Autowired
    private EntityManagerFactory emf;
    
    @Before
    public void getClubs() 
    {
        pierce = clubService.getByID (1);
        lawrence = clubService.getByID (2);
        devo = clubService.getByID (3);
    }
    
    @Test
    public void testGetEMailConfig()
    {
    	EMailConfig config = pierce.getEMailConfig();
    	assertExistingConfig(config, 587);
    }
    
    @Test
    public void testUpdateEMailConfig()
    {
    	try
    	{
	    	EMailConfig config = pierce.getEMailConfig();
	    	config.setPort(8025);
	    	config = clubService.setEMailConfig(pierce, config);
	    	assertExistingConfig(config, 8025);
	
	    	emf.getCache().evict(Club.class);
	    	emf.getCache().evict(EMailConfig.class);
	    	config = clubService.getByID(pierce.getID()).getEMailConfig();
	    	assertExistingConfig(config, 8025);
    	}
    	finally
    	{
    		resetEMailConfig(emf);
    	}
    }
    
    @Test(expected=NotInYourClub.class)
    public void testUpdateEMailConfigWrongClub()
    {
    	EMailConfig config = pierce.getEMailConfig();
    	config = clubService.setEMailConfig(devo, config);
    }
    
    @Test
    public void testCreateEMailConfig()
    {
    	
    	try
    	{
	    	EMailConfig config = createEMailConfig();
	    	config = clubService.setEMailConfig(lawrence, config);
	    	assertNotEquals(0, config.getID());
	    	assertNewConfig(config);
	
	    	emf.getCache().evict(Club.class);
	    	emf.getCache().evict(EMailConfig.class);
	    	config = clubService.getByID(lawrence.getID()).getEMailConfig();
	    	assertNewConfig(config);
    	}
    	finally
    	{
    		removeEMailConfig(emf);
    	}
    }
}
