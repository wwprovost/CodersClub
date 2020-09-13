package codersclub;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceException;

import codersclub.db.JPAService;
import codersclub.ex.NotInYourClub;

public class ClubService
    extends JPAService<Club>
{
    public ClubService (EntityManagerFactory emf)
    {
        super (emf, Club.class, "fullName");
    }
    
    public EMailConfig setEMailConfig(Club club, EMailConfig config)
    {
        EntityManager em = emf.createEntityManager ();
        try
        {
        	em.getTransaction().begin();

        	if (club.getEMailConfig() != null)
        	{
        		if (club.getEMailConfig().getID() == config.getID())
        			config = em.merge(config);
        		else
        			throw new NotInYourClub();
        	}
        	else
        	{
        		em.persist(config);
        		club.setEMailConfig(config);
        		em.merge(club);
        	}
        	
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
        
        return config;
    }
}
