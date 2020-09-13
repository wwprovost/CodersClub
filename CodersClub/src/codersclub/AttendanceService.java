package codersclub;

import java.util.Date;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceException;
import javax.persistence.TemporalType;

import codersclub.db.JPAService;

public class AttendanceService
    extends JPAService<Attendance>
{
    public AttendanceService (EntityManagerFactory emf)
    {
        super (emf, Attendance.class, "attended");
    }
    
    public void recordAttendance (Coder coder)
    {
        Date attended = new Date ();
        
        EntityManager em = null;
        try
        {
            em = emf.createEntityManager ();
            em.getTransaction ().begin ();

            if (em.createQuery ("select a from Attendance a " +
                "where a.coder.ID = :ID and a.attended = :attended", 
                    Attendance.class)
                .setParameter ("ID", coder.getID ())
                .setParameter ("attended", attended, TemporalType.DATE)
                .getResultList ().isEmpty ())
            {
                em.persist (new Attendance (coder, attended));
            }
            
            em.getTransaction ().commit ();
        }
        finally
        {
            if (em != null)
                em.close ();
        }
    }
    
    public List<Coder> getAttendance(Club club, Date from, Date to)
    {
    	if (from == null)
    		from = new Date(0);
    	if (to == null)
    		to = new Date(253402214400000L); // end of year 9999

        EntityManager em = emf.createEntityManager ();
        List<Coder> result = null;
        try
        {
            result = em.createQuery 
                ("select c from Coder c where c.club.ID = :club and c.ID in "
                		+ "(select a.coder.ID from Attendance a "
                		+ "where a.attended between :from and :to) "
                		+ "order by c.lastName, c.firstName", 
                    Coder.class)
                .setParameter ("club", club.getID())
                .setParameter ("from", from, TemporalType.DATE)
                .setParameter ("to", to, TemporalType.DATE)
                .getResultList ();
            
            for (Coder coder : result)
            	coder.setAttendanceRange(from, to);
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
        }
        finally
        {
            em.close ();
        }
        
        return result;
    }
}
