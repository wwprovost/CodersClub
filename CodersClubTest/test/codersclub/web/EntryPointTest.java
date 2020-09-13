package codersclub.web;

import static org.junit.Assert.assertEquals;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.servlet.http.HttpServletRequest;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.AuthnTest;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=WebTestConfig.class)
public class EntryPointTest
{
	public static final String USERNAME_PIERCE_CODER = "1_pierce_user1";
	public static final String USERNAME_PIERCE_COACH = "1_Stephen_Intille";
	public static final String USERNAME_LAWRENCE_ADMIN = "2_Kirsten_Alper";
	public static final String USERNAME_DEVO_SENIOR = "3_Phil_Durbin";
	
	public static final int ID_PIERCE_CODER = 1;
	
	public static final String CODER_RESPONSE = "Coder.do";
	public static final String COACH_RESPONSE = "redirect:Coach/Coach.do";
	public static final String ADMIN_RESPONSE = "redirect:Staff/coders.html";
	
    @Autowired
    private EntryPoint entryPoint;
    
    @Autowired
    private HttpServletRequest request;
    
    @Autowired
    private EntityManagerFactory emf;
    @Test
    public void testCoderHandling() 
    {
    	try {
	    	AuthnTest.username = USERNAME_PIERCE_CODER;
	    	assertEquals(CODER_RESPONSE, entryPoint.seeWhoLoggedIn(request));
    	}
    	finally
    	{
    		EntityManager em = emf.createEntityManager();
    		try
    		{
    			em.getTransaction().begin();
    			em.createQuery("delete from Attendance where coder.ID = :ID and attended = :when")
		    		.setParameter("ID", ID_PIERCE_CODER)
		    		.setParameter("when", Date.from(LocalDate.now()
		    				.atStartOfDay(ZoneId.systemDefault()).toInstant()))
		    		.executeUpdate();
    			em.getTransaction().commit();
    		}
    		catch (Exception ex) 
    		{
    			ex.printStackTrace();
    		}
    		
    		em.close();
    	}
    }
    
    @Test
    public void testCoachHandling() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	assertEquals(COACH_RESPONSE, entryPoint.seeWhoLoggedIn(request));
    }
    
    @Test
    public void testAdminHandling() 
    {
    	AuthnTest.username = USERNAME_LAWRENCE_ADMIN;
    	assertEquals(ADMIN_RESPONSE, entryPoint.seeWhoLoggedIn(request));
    }
    
    @Test
    public void testSeniorHandling() 
    {
    	AuthnTest.username = USERNAME_DEVO_SENIOR;
    	assertEquals(COACH_RESPONSE, entryPoint.seeWhoLoggedIn(request));
    }
}
