package codersclub.ws;

import static org.junit.Assert.assertEquals;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.AuthnTest;
import codersclub.ex.AuthorizationFailure;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=WSTestConfig.class)
public class WorkControllerTest
{
	public static final String CODER_USERNAME_1 = "1_pierce_user1";
	public static final String CODER_USERNAME_2 = "1_pierce_user2";
	public static final String CODER_USERNAME_5 = "1_pierce_user5";
	public static final String COACH_USERNAME = "1_Will_Provost";
	
	public static final int CODER_ID_1 = 1;
	public static final int CODER_ID_2 = 2;
	public static final int CODER_ID_5 = 5;
	
	public static final String PAGE_ID_SQUARES = "NumberCrunch:Squares";
	public static final String PAGE_ID_FIBONACCI = "NumberCrunch:Fibonacci";
	public static final String PAGE_ID_PRIMES = "NumberCrunch:Primes";
	public static final String WORK_SQUARES = "X";
	
	public static final String PAGE_ID_TEAMWORK = "x";
	public static final String TEAM_CODE = "123456";
	public static final String TEAMWORK_LEFT = "left";
	public static final String TEAMWORK_RIGHT = "right";
	
    @Autowired
    private WorkController controller;

    @Autowired
    private EntityManagerFactory emf;

    @Before
    public void getCoders()
    {
    	AuthnTest.username = CODER_USERNAME_5;
    }
    
    @Test
    public void testgetWork()
    {
    	assertEquals(WORK_SQUARES, controller.getWork(PAGE_ID_SQUARES, 
    		null, null, null));
    }
    
    @Test
    public void testShadowing()
    {
    	AuthnTest.username = COACH_USERNAME;
    	assertEquals(WORK_SQUARES, controller.getWork(PAGE_ID_SQUARES, 
    		CODER_ID_5, null, null));
    }
    
    @Test(expected=AuthorizationFailure.class)
    public void testShadowingAsACoder()
    {
    	AuthnTest.username = CODER_USERNAME_1;
    	controller.getWork(PAGE_ID_SQUARES, CODER_ID_5, null, null);
    }
    
    @Test
    public void testgetTeammateWork()
    {
    	AuthnTest.username = CODER_USERNAME_1;
    	assertEquals(TEAMWORK_RIGHT, controller.getWork(PAGE_ID_TEAMWORK, 
    			null, TEAM_CODE, CODER_ID_2));
    }
    
    @Test
    public void testgetTeammateWorkNoTeamProvided()
    {
    	AuthnTest.username = CODER_USERNAME_1;
    	assertEquals(TEAMWORK_LEFT, controller.getWork(PAGE_ID_TEAMWORK, 
    			null, null, CODER_ID_2));
    }
    
    @Test(expected=TeamController.NoSuchTeam.class)
    public void testgetTeammateWorkNoSuchTeam()
    {
    	AuthnTest.username = CODER_USERNAME_1;
    	controller.getWork(PAGE_ID_SQUARES, null, "NoSuchTeam", CODER_ID_2);
    }
    
    @Test
    public void testgetNoWork()
    {
    	assertEquals("", controller.getWork("NoWorkHere", null, null, null));
    }

    @Test
    public void testPutNewWork()
    {
    	controller.putWork(PAGE_ID_PRIMES, "primes");
    	
    	EntityManager em = null;
    	try
    	{
    		em = emf.createEntityManager();
    		assertEquals("primes", em.createQuery
    				("select w.code from Work w where w.coder.ID = :coder and w.pageID = :page", 
    						String.class)
    				.setParameter("coder", CODER_ID_5)
    				.setParameter("page", PAGE_ID_PRIMES)
    				.getSingleResult());
    	}
    	finally
    	{
    		em.getTransaction().begin();
    		em.createQuery("delete from Work where coder.ID=:coder and pageID=:page")
				.setParameter("coder", CODER_ID_5)
				.setParameter("page", PAGE_ID_PRIMES)
    			.executeUpdate();
    		em.getTransaction().commit();
    		
    		em.close();
    	}
    }
    

    @Test
    public void testReplaceWork()
    {
    	controller.putWork(PAGE_ID_SQUARES, "squares");
    	
    	EntityManager em = null;
    	try
    	{
    		em = emf.createEntityManager();
    		assertEquals("squares", em.createQuery
    				("select w.code from Work w where w.coder.ID = :coder and w.pageID = :page", 
    						String.class)
    				.setParameter("coder", CODER_ID_5)
    				.setParameter("page", PAGE_ID_SQUARES)
    				.getSingleResult());
    	}
    	finally
    	{
    		em.getTransaction().begin();
    		em.createQuery("update Work set code='X' where coder.ID=:coder and pageID=:page")
				.setParameter("coder", CODER_ID_5)
				.setParameter("page", PAGE_ID_SQUARES)
    			.executeUpdate();
    		em.getTransaction().commit();
    		
    		em.close();
    	}
    }

    @Test
    public void testRemoveWork()
    {
    	//TODO
    }
}
