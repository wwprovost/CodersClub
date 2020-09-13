package codersclub;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import java.text.SimpleDateFormat;
import java.util.Date;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=PersistenceTestConfig.class)
public class WorkServiceTest
{
	public static final int CODER_ID = 5;
	public static final String PAGE_ID_SQUARES = "NumberCrunch:Squares";
	public static final String PAGE_ID_FIBONACCI = "NumberCrunch:Fibonacci";
	public static final String PAGE_ID_PRIMES = "NumberCrunch:Primes";
	
    @Autowired
    private WorkService workService;

    @Autowired
    private CoderService coderService;
    
    @Autowired
    private EntityManagerFactory emf;

    private Coder coder;
	private SimpleDateFormat formatter;
    private String today;
    
    @Before
    public void getCoders()
    {
    	coder = coderService.getByID(CODER_ID);
    	formatter = new SimpleDateFormat("yyyy-MM-dd");
    	today = formatter.format(new Date());
    }
    
    @Test
    public void testgetWork()
    {
    	assertEquals("X", workService.getWork(coder, PAGE_ID_SQUARES));
    }
    
    @Test
    public void testgetNoWork()
    {
    	assertEquals("", workService.getWork(coder, "NoWorkHere"));
    }

    @Test
    public void testPutNewWork()
    {
    	workService.updateOrInsertWork(coder, PAGE_ID_PRIMES, "primes");
    	
    	EntityManager em = null;
    	try
    	{
    		em = emf.createEntityManager();
    		Work work = em.createQuery
    				("select w from Work w where w.coder.ID = :coder and w.pageID = :page", 
    						Work.class)
    				.setParameter("coder", CODER_ID)
    				.setParameter("page", PAGE_ID_PRIMES)
    				.getSingleResult();
    	    assertEquals("primes", work.getCode());
    	    assertEquals(today, formatter.format(work.getWhen()));
    	}
    	finally
    	{
    		em.getTransaction().begin();
    		em.createQuery("delete from Work where coder.ID=:coder and pageID=:page")
				.setParameter("coder", CODER_ID)
				.setParameter("page", PAGE_ID_PRIMES)
    			.executeUpdate();
    		em.getTransaction().commit();
    		
    		em.close();
    	}
    }
    

    @Test
    public void testReplaceWork()
    {
    	workService.updateOrInsertWork(coder, PAGE_ID_SQUARES, "squares");
    	
    	EntityManager em = null;
    	try
    	{
    		em = emf.createEntityManager();
    		Work work = em.createQuery
    				("select w from Work w where w.coder.ID = :coder and w.pageID = :page", 
    						Work.class)
    				.setParameter("coder", CODER_ID)
    				.setParameter("page", PAGE_ID_SQUARES)
    				.getSingleResult();
    		assertEquals("squares", work.getCode());
    	    assertEquals(today, formatter.format(work.getWhen()));
    	}
    	finally
    	{
    		em.getTransaction().begin();
    		em.createQuery("update Work set code='X' where coder.ID=:coder and pageID=:page")
				.setParameter("coder", CODER_ID)
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
    
    @Test
    public void testGetLatestActivityCoder6() throws Exception 
    {
    	Date Jan1_2018 = formatter.parse("2018-01-01");
    	assertEquals("NumberCrunch:Fibonacci", 
    			workService.getLatestActivity(coderService.getByID(6), Jan1_2018));
    }
    
    @Test
    public void testGetLatestActivityCoder9() throws Exception 
    {
    	Date Jan1_2018 = formatter.parse("2018-01-01");
    	assertEquals("NumberCrunch:Squares", 
    			workService.getLatestActivity(coderService.getByID(9), Jan1_2018));
    }
    
    @Test
    public void testGetLatestActivityCoder5Recent() throws Exception 
    {
    	Date Jan1_2019 = formatter.parse("2019-01-01");
    	assertNull(workService.getLatestActivity(coderService.getByID(6), Jan1_2019));
    }
    
    @Test
    public void testGetLatestActivityCoder8() throws Exception 
    {
    	Date Jan1_2018 = formatter.parse("2018-01-01");
    	assertNull(workService.getLatestActivity(coderService.getByID(8), Jan1_2018));
    }
}
