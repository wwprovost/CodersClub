package codersclub;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceException;

import codersclub.db.JPAService;

public class UserService<T extends User>
    extends JPAService<T>
{
    private static final Logger LOG = 
        Logger.getLogger(UserService.class.getName());
    
    public UserService (EntityManagerFactory emf, Class<T> entityClass, String... ordering)
    {
        super (emf, entityClass, ordering);
    }
    
    public List<T> getAllByClub(Club club)
    {
        EntityManager em = emf.createEntityManager ();
        List<T> result = null;
        try
        {
            result = em.createQuery 
                ("select c from " + cls.getSimpleName() + " c where c.club.ID = :club_id " +
                    "order by c.lastName, c.firstName", 
                    cls)
                .setParameter ("club_id", club.getID())
                .getResultList ();
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
    
    public T getByClubAndName(Club club, String firstName, String lastName)
    {
        EntityManager em = emf.createEntityManager ();
        T result = null;
        try
        {
            result = em.createQuery 
                ("select c from " + cls.getSimpleName() + " c " +
                 "where c.club.ID = :club_id and lower(c.firstName) = :first and lower(c.lastName) = :last", 
                    cls)
                .setParameter ("club_id", club.getID())
                .setParameter ("first", firstName.toLowerCase())
                .setParameter ("last", lastName.toLowerCase())
                .getSingleResult ();
        }
        catch (PersistenceException ex)
        {
            LOG.log(Level.FINE, String.format("No such %s %s_%s_%s.", 
            		cls.getSimpleName().toLowerCase(),
            		club.getID(), firstName, lastName), ex);
        }
        finally
        {
            em.close ();
        }
        
        return result;
    }
    
    public boolean exists(Club club, String firstName, String lastName)
    {
        return getByClubAndName(club, firstName, lastName) != null;
    }
}
