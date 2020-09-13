package codersclub;

import java.util.Date;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceException;

import codersclub.db.JPAService;

public class CompletedLevelService
    extends JPAService<CompletedLevel>
{
    public CompletedLevelService (EntityManagerFactory emf)
    {
        super (emf, CompletedLevel.class, "coder.ID");
    }
    
    public List<CompletedLevel> getAllSince(Date since)
    {
        EntityManager em = emf.createEntityManager ();
        List<CompletedLevel> results = null;
        
        try
        {
        	em.getTransaction().begin();

            results = em.createQuery
                    ("select cl from CompletedLevel cl " +
                   		"where cl.dateCompleted >= :since and cl.level.number =" +
                   		"(select max(comp.level.number) from CompletedLevel comp " +
                   			"where comp.coder.ID = cl.coder.ID) " +
                        " order by cl.coder.lastName, cl.coder.firstName, cl.level.number",
                        CompletedLevel.class)
                    .setParameter("since", since)
                    .getResultList ();
        	
        	em.getTransaction().commit();
        }
        catch (PersistenceException ex)
        {
        	if (em.getTransaction().isActive())
        		em.getTransaction().rollback();
        	
            ex.printStackTrace ();
        }
        finally
        {
            em.close ();
        }
        
        return results;
    }
}
