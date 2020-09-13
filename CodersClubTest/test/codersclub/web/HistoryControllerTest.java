package codersclub.web;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.web.servlet.ModelAndView;

import codersclub.Activity;
import codersclub.AuthnTest;
import codersclub.Coder;
import codersclub.CoderService;
import codersclub.CompletedActivity;
import codersclub.CompletedLevel;
import codersclub.Level;
import codersclub.ex.NotInYourClub;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=WebTestConfig.class)
public class HistoryControllerTest
{
	public static final String USERNAME_PIERCE_COACH = "1_Will_Provost";
	public static final String COACH_NAME = "Will Provost";
	
	public static final int CODER1_ID = 1;
	public static final int CODER2_ID = 2;
	public static final int CODER_NONEXISTENT_ID = 22;
	public static final int CODER_OTHER_CLUB_ID = 8;
	
	public static final String COMPLETED_ATTR = "completed";
	public static final String POINTS_ATTR = "points";
	public static final String CODER_ATTR = "coder";

	private static SimpleDateFormat DBFormatter = new SimpleDateFormat("yyyy-MM-dd");
	private static SimpleDateFormat outputFormatter = new SimpleDateFormat("M/d/yy");
	private static final long MILLIS_PER_DAY = 1000L * 60 * 60 * 24;
	
    @Autowired
    private HistoryController controller;
    
    @Autowired
    private EntityManagerFactory emf;
    
    @Autowired
    private CoderService coderService;
    
    @SuppressWarnings("unchecked")
    @Test
    public void testGetHistoryCoder1() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
        ModelAndView mav = controller.getHistory(CODER1_ID);
        Map<Integer,Date> completed = (Map<Integer,Date>) mav.getModel ().get (COMPLETED_ATTR);
        assertEquals(2, completed.keySet().size());
        assertEquals("2018-05-14", DBFormatter.format(completed.get(1)));
        assertEquals("2018-05-14", DBFormatter.format(completed.get(2)));
        
        Map<Integer,Integer> points = (Map<Integer,Integer>) mav.getModel().get(POINTS_ATTR);
        assertEquals(1, points.keySet().size());
        assertEquals(2, points.get(1).intValue());
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testGetHistoryCoder2() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
        ModelAndView mav = controller.getHistory(CODER2_ID);
        Map<Integer,Date> completed = (Map<Integer,Date>) mav.getModel ().get (COMPLETED_ATTR);
        assertEquals(2, completed.keySet().size());
        
        Map<Integer,Integer> points = (Map<Integer,Integer>) mav.getModel().get(POINTS_ATTR);
        assertEquals(1, points.keySet().size());
    }

    @Test(expected=NullPointerException.class)
    public void testGetHistoryNoSuchCoder() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
        controller.getHistory(CODER_NONEXISTENT_ID);
    }

    @Test(expected=NotInYourClub.class)
    public void testGetHistoryOtherClub() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
        controller.getHistory(CODER_OTHER_CLUB_ID);
    }

    @Test
    public void testToggleCompletedLevelOn() 
        	throws Exception
    {
        EntityManager em = null;
        try
        {
            em = emf.createEntityManager();

        	AuthnTest.username = USERNAME_PIERCE_COACH;
            assertEquals(outputFormatter.format(new Date()), 
            		controller.toggleCompletedLevel(CODER1_ID, 2));

        	CompletedLevel completedLevel =
        		em.createQuery("select cl from CompletedLevel cl " +
        						"where cl.level.number = 2 and cl.coder.ID = 1", 
        				CompletedLevel.class)
        			.getSingleResult();
        	assertEquals("Will Provost", completedLevel.getGrantedBy());
        	System.out.println(new Date());
        	System.out.println(completedLevel.getDateCompleted());
        	assertTrue(new Date().getTime() - completedLevel.getDateCompleted().getTime()
        			< MILLIS_PER_DAY);
        }
        finally
        {
        	try
        	{
            	em.getTransaction().begin();
        		em.createQuery("delete from CompletedLevel " +
        				"where level.number = 2 and coder.ID = 1")
        			.executeUpdate();
            	em.getTransaction().commit();
        	}
        	finally
        	{
        		em.close();
        	}
        }
    }

    @Test
    public void testToggleCompletedLevelOff() 
    	throws Exception
    {
        EntityManager em = null;
        try
        {
        	em = emf.createEntityManager();

        	AuthnTest.username = USERNAME_PIERCE_COACH;
        	assertEquals("Completed", controller.toggleCompletedLevel(CODER1_ID, 1));
            
        	assertEquals(0,
        		em.createQuery("select cl from CompletedLevel cl " +
        						"where cl.level.number = 1 and cl.coder.ID = 1", 
        				CompletedLevel.class)
        			.getResultList().size());
        }
        finally
        {
        	try
        	{
        		em.getTransaction().begin();
        		Coder coder = em.find(Coder.class, CODER1_ID);
        		Level level = em.find(Level.class, 1);
        		CompletedLevel completedLevel = new CompletedLevel
        				(coder, level, COACH_NAME, DBFormatter.parse("2018-05-17"));
        		em.persist(completedLevel);
            	em.getTransaction().commit();
        	}
        	finally
        	{
        		em.close();
        	}
        }
    }

    @Test(expected=NullPointerException.class)
    public void testToggleCompletedLevelNoSuchCoder() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	controller.toggleCompletedLevel(CODER_NONEXISTENT_ID, 1);
    }

    @Test(expected=NotInYourClub.class)
    public void testToggleCompletedLevelOtherClub() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	controller.toggleCompletedLevel(CODER_OTHER_CLUB_ID, 1);
    }


    @Test
    public void testToggleEnabledLevel() 
        	throws Exception
    {
        try
        {
        	AuthnTest.username = USERNAME_PIERCE_COACH;
        	
            controller.toggleEnabledLevel(CODER1_ID, 3);
            emf.getCache().evict(Coder.class);
            Coder coder = coderService.getByID(CODER1_ID);
            assertEquals(3, coder.getEnabledLevel().intValue());
        	
            controller.toggleEnabledLevel(CODER1_ID, 3);
            emf.getCache().evict(Coder.class);
            coder = coderService.getByID(CODER1_ID);
            assertEquals(2, coder.getEnabledLevel().intValue());
        }
        finally
        {
    		Coder coder = coderService.getByID(CODER1_ID);
    		coder.setEnabledLevel(0);
    		coderService.update(coder);
        }
    }
    @Test(expected=NullPointerException.class)
    public void testToggleEnabledLevelNoSuchCoder() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	controller.toggleEnabledLevel(CODER_NONEXISTENT_ID, 1);
    }

    @Test(expected=NotInYourClub.class)
    public void testToggleEnabledLevelOtherClub() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	controller.toggleEnabledLevel(CODER_OTHER_CLUB_ID, 1);
    }

    @Test
    public void testToggleCompletedActivityOn() 
        	throws Exception
    {
        EntityManager em = null;
        try
        {
            em = emf.createEntityManager();

            AuthnTest.username = USERNAME_PIERCE_COACH;
        	//assertEquals(outputFormatter.format(new Date()),
            assertEquals("5/14/18", controller.toggleCompletedActivity(CODER1_ID, 3));

        	CompletedActivity completedActivity =
        		em.createQuery("select ca from CompletedActivity ca " +
        						"where ca.activity.ID = 3 and ca.coder.ID = 1", 
        				CompletedActivity.class)
        			.getSingleResult();
        	assertEquals("Will Provost", completedActivity.getCertifiedBy());
        	assertEquals("2018-05-14",
        			DBFormatter.format(completedActivity.getDateCompleted()));
        }
        finally
        {
        	try
        	{
            	em.getTransaction().begin();
        		em.createQuery("delete from CompletedActivity " +
        				"where activity.ID = 3 and coder.ID = 1")
        			.executeUpdate();
            	em.getTransaction().commit();
        	}
        	finally
        	{
        		if (em != null)
        			em.close();
        	}
        }
    }

    @Test
    public void testToggleCompletedActivityOnNoAttendance() 
        	throws Exception
    {
        EntityManager em = null;
        try
        {
            em = emf.createEntityManager();

            AuthnTest.username = USERNAME_PIERCE_COACH;
        	assertEquals(outputFormatter.format(new Date()),
        			controller.toggleCompletedActivity(3, 1));

        	CompletedActivity completedActivity =
        		em.createQuery("select ca from CompletedActivity ca " +
        						"where ca.activity.ID = 1 and ca.coder.ID = 3", 
        				CompletedActivity.class)
        			.getSingleResult();
        	assertEquals("Will Provost", completedActivity.getCertifiedBy());
        	assertEquals(DBFormatter.format(new Date()),
        			DBFormatter.format(completedActivity.getDateCompleted()));
        }
        finally
        {
        	try
        	{
            	em.getTransaction().begin();
        		em.createQuery("delete from CompletedActivity " +
        				"where activity.ID = 1 and coder.ID = 3")
        			.executeUpdate();
            	em.getTransaction().commit();
        	}
        	finally
        	{
        		if (em != null)
        			em.close();
        	}
        }
    }

    @Test
    public void testToggleCompletedActivityOff() 
    	throws Exception
    {
        EntityManager em = null;
        try
        {
        	em = emf.createEntityManager();

        	AuthnTest.username = USERNAME_PIERCE_COACH;
        	assertEquals("", controller.toggleCompletedActivity(CODER1_ID, 1));
            
        	assertEquals(0,
        		em.createQuery("select ca from CompletedActivity ca " +
        						"where ca.activity.ID = 1 and ca.coder.ID = 1", 
        				CompletedActivity.class)
        			.getResultList().size());
        }
        finally
        {
        	try
        	{
        		em.getTransaction().begin();
        		Coder coder = em.find(Coder.class, CODER1_ID);
        		Activity activity = em.find(Activity.class, 1);
        		CompletedActivity completedActivity = new CompletedActivity
        				(coder, activity, null, COACH_NAME, DBFormatter.parse("2018-05-14"));
        		em.persist(completedActivity);
            	em.getTransaction().commit();
        	}
        	finally
        	{
        		if (em != null)
        			em.close();
        	}
        }
    }

    @Test(expected=NullPointerException.class)
    public void testToggleCompletedActivityNoSuchCoder() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	controller.toggleCompletedActivity(CODER_NONEXISTENT_ID, 1);
    }

    @Test(expected=NotInYourClub.class)
    public void testToggleCompletedActivityOtherClub() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	controller.toggleCompletedActivity(CODER_OTHER_CLUB_ID, 1);
    }

}
