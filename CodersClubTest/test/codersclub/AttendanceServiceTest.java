package codersclub;

import static org.junit.Assert.assertEquals;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.db.JPAService;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=PersistenceTestConfig.class)
public class AttendanceServiceTest
{
	public static final int CODER_ID_1 = 1;
	public static final int CODER_ID_2 = 2;
	public static final int CODER_ID_3 = 3;
	
	public static final Date ATTENDED_FROM = new Date(1522800000000L); // April 4, 2018 GMT
	public static final Date ATTENDED_TO = new Date(1526342400000L); // May 15, 2018 GMT
	
    @Autowired
    private AttendanceService attendanceService;
    
    @Autowired
    private EntityManagerFactory emf;
    
    @Autowired
    private JPAService<Club> clubService;

    @Autowired
    private CoderService coderService;

    private Club club;
    private Coder coder3;
    private Date today;
    
    @Before
    public void getCoders()
    {
    	club = clubService.getByID(1);
    	coder3 = coderService.getByID(CODER_ID_3);
    	
    	today = Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());

		emf.getCache().evict(Attendance.class);
    }
    
    @Test
    public void testRecordAttendance()
    {
    	EntityManager em = emf.createEntityManager();
    	try
    	{
	    	assertEquals(0, em.createQuery
	    		("select a from Attendance a where a.coder.ID = :ID and a.attended = :when", 
    				Attendance.class)
	    		.setParameter("ID", CODER_ID_3)
	    		.setParameter("when", today)
	    		.getResultList().size());
	    	
	    	attendanceService.recordAttendance(coder3);

	    	assertEquals(1, em.createQuery
		    		("select a from Attendance a where a.coder.ID = :ID and a.attended = :when", 
	    				Attendance.class)
		    		.setParameter("ID", CODER_ID_3)
		    		.setParameter("when", today)
		    		.getResultList().size());
    	}
    	finally
    	{
    		try
    		{
    			em.getTransaction().begin();
    			em.createQuery("delete from Attendance where coder.ID = :ID and attended = :when")
		    		.setParameter("ID", CODER_ID_3)
		    		.setParameter("when", today)
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
    public void testRecordAttendanceTwice()
    {
    	EntityManager em = emf.createEntityManager();
    	try
    	{
	    	assertEquals(0, em.createQuery
	    		("select a from Attendance a where a.coder.ID = :ID and a.attended = :when", 
    				Attendance.class)
	    		.setParameter("ID", CODER_ID_3)
	    		.setParameter("when", today)
	    		.getResultList().size());
	    	
	    	attendanceService.recordAttendance(coder3);
	    	attendanceService.recordAttendance(coder3);

	    	assertEquals(1, em.createQuery
		    		("select a from Attendance a where a.coder.ID = :ID and a.attended = :when", 
	    				Attendance.class)
		    		.setParameter("ID", CODER_ID_3)
		    		.setParameter("when", today)
		    		.getResultList().size());
    	}
    	finally
    	{
    		try
    		{
    			em.getTransaction().begin();
    			em.createQuery("delete from Attendance where coder.ID = :ID and attended = :when")
		    		.setParameter("ID", CODER_ID_3)
		    		.setParameter("when", today)
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
    public void testGetAttendanceFromAndTo()
    {
    	List<Coder> result = attendanceService.getAttendance(club, ATTENDED_FROM, ATTENDED_TO);
    	
    	assertEquals(2, result.size());
    	assertEquals(CODER_ID_1, result.get(0).getID());
    	assertEquals(4, result.get(0).getAttendance().count());
    	assertEquals(CODER_ID_2, result.get(1).getID());
    	assertEquals(4, result.get(1).getAttendance().count());
    }
    
    
    @Test(expected=NullPointerException.class)
    public void testGetAttendanceNoClub()
    {
    	attendanceService.getAttendance(null, ATTENDED_FROM, ATTENDED_TO);
    }
    
    @Test
    public void testGetAttendanceFrom()
    {
    	List<Coder> result = attendanceService.getAttendance(club, ATTENDED_FROM, null);
    	
    	assertEquals(2, result.size());
    	assertEquals(CODER_ID_1, result.get(0).getID());
    	assertEquals(4, result.get(0).getAttendance().count());
    	assertEquals(CODER_ID_2, result.get(1).getID());
    	assertEquals(6, result.get(1).getAttendance().count());
    }
    
    @Test
    public void testGetAttendanceTo()
    {
    	List<Coder> result = attendanceService.getAttendance(club, null, ATTENDED_TO);
    	
    	assertEquals(2, result.size());
    	assertEquals(CODER_ID_1, result.get(0).getID());
    	assertEquals(8, result.get(0).getAttendance().count());
    	assertEquals(CODER_ID_2, result.get(1).getID());
    	assertEquals(4, result.get(1).getAttendance().count());
    }
    
    @Test
    public void testGetAttendanceForever()
    {
    	List<Coder> result = attendanceService.getAttendance(club, null, null);
    	
    	assertEquals(2, result.size());
    	assertEquals(CODER_ID_1, result.get(0).getID());
    	assertEquals(8, result.get(0).getAttendance().count());
    	assertEquals(CODER_ID_2, result.get(1).getID());
    	assertEquals(6, result.get(1).getAttendance().count());
    }
}
