package codersclub;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceException;

public class StaffService
    extends UserService<Staff>
{
    public StaffService (EntityManagerFactory emf)
    {
        super (emf, Staff.class, "lastName", "firstName");
    }
    
    private List<Staff> getAllByRole(Club club, String role) 
    {
        EntityManager em = emf.createEntityManager ();
        List<Staff> result = null;
        try
        {
            result = em.createQuery 
                ("select s from Staff s where s.club.ID = :club_id " +
                	"and s." + role + "=1 " +
                    "order by s.lastName, s.firstName", 
                    Staff.class)
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
    
    public List<Staff> getAllCoaches(Club club)
    {
    	return getAllByRole(club, "coach");
    }
    
    public List<Staff> getAllAdmins(Club club)
    {
    	return getAllByRole(club, "admin");
    }
    
    public List<Staff> getAllSeniors(Club club)
    {
    	return getAllByRole(club, "senior");
    }

    /**
     * We @JsonIgnore the password in outbound representations.
     * This means we get some PUTs of objects with missing passwords.
     * We need to fix those back up before trying an update. 
     */
    @Override
    public Staff update (Staff modifiedStaff)
    {
    	if (modifiedStaff.getPassword() == null)
    	{
    		User existingStaff = getByID(modifiedStaff.getID());
    		modifiedStaff.setPassword(existingStaff.getPassword());
    	}
    	
    	return super.update(modifiedStaff);
    }
}
