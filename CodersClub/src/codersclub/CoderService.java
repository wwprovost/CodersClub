package codersclub;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceException;

public class CoderService
    extends UserService<Coder>
{
    public CoderService (EntityManagerFactory emf)
    {
        super (emf, Coder.class, "lastName", "firstName");
    }
    
    public List<String> getGroups(Club club)
    {
        EntityManager em = emf.createEntityManager ();
        List<String> result = null;
        try
        {
            result = em.createQuery 
                ("select distinct c.group from Coder c where c.club.ID = :club_id and c.group != null", 
                    String.class)
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
    
    private void markOverdue(Club club, List<Coder> coders) 
    {
        EntityManager em = emf.createEntityManager ();
        try
        {
            List<String> due = em.createQuery 
            		("select concat(cast(ca.coder.ID as char(10)), 'L', cast(ca.activity.level.number as char(10))) " +
            			"from CompletedActivity ca " +
                		"where ca.coder.club.ID = :club_id " +
                		"group by ca.coder.ID, ca.activity.level.number, ca.activity.level.points " +
                		"having sum(ca.activity.points) >= ca.activity.level.points " +
                		"order by ca.coder.ID, ca.activity.level.number", 
                		String.class)
                .setParameter ("club_id", club.getID())
                .getResultList ();

            List<String> paid = em.createQuery 
            		("select concat(cast(cl.coder.ID as char(10)), 'L', cast(cl.level.number as char(10))) " +
                    		"from CompletedLevel cl " +
                    		"where cl.coder.club.ID = :club_id " +
                    		"order by cl.coder.ID, cl.level.number", 
                    		String.class)
                    .setParameter ("club_id", club.getID())
                    .getResultList ();
            
            Set<Integer> overdue = new HashSet<>();
            due.stream().filter(d -> !paid.contains(d))
            	.mapToInt(d -> Integer.parseInt(d.substring(0, d.indexOf("L")).trim()))
            	.forEach(overdue::add);
            
            for (Coder coder : coders)
            {
            	if (overdue.contains(coder.getID()))
            	{
            		coder.setOverdue(true);
            	}
            }
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
        }
        finally
        {
            em.close ();
        }
    }
    
    public Map<String,List<Coder>> getGroupsOfCoders(Club club) 
    {
        EntityManager em = emf.createEntityManager ();
        Map<String,List<Coder>> result = new TreeMap<>();
        try
        {
            for (Coder coder : em.createQuery 
                ("select c from Coder c where c.club.ID = :club_id and c.group != null " +
                    "order by c.lastName, c.firstName", 
                    Coder.class)
                .setParameter ("club_id", club.getID())
                .getResultList ())
            {
                if (!result.containsKey(coder.getGroup ()))
                {
                    result.put (coder.getGroup(), new ArrayList<>());
                }
                
                result.get(coder.getGroup()).add (coder);
            }
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
        }
        finally
        {
            em.close ();
        }
        
        for (List<Coder> group : result.values())
        {
        	markOverdue(club, group);
        }
        
        return result;
    }
    
    public List<Coder> getGroupOfCoders(Club club, String group) 
    {
        EntityManager em = emf.createEntityManager ();
        List<Coder> result = null;
        try
        {
            result = em.createQuery 
                ("select c from Coder c where c.club.ID = :club_id and c.group = :group " +
                    "order by c.lastName, c.firstName", 
                    Coder.class)
                .setParameter ("club_id", club.getID())
                .setParameter ("group", group)
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
        
        markOverdue(club, result);
        return result;
    }
    
    public void clearGroups(Club club) 
    {
        EntityManager em = emf.createEntityManager ();
        try
        {
        	em.getTransaction().begin();
            em.createQuery ("update Coder c set c.group = null where c.club.ID = :club")
            	.setParameter("club", club.getID())
                .executeUpdate ();
            em.getTransaction().commit();
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
            if (em.getTransaction().isActive())
            	em.getTransaction().rollback();
        }
        finally
        {
            em.close ();
        }
    }
    
    private void cleanUpCoder(int ID)
    {
        EntityManager em = emf.createEntityManager ();
        try
        {
        	if (em.find(Coder.class, ID) == null)
        		throw new IllegalArgumentException ("No coder with ID of " + ID);
        	
        	em.getTransaction().begin();
        	
	    	Class<?>[] related = { CompletedActivity.class, CompletedLevel.class,
	    			Attendance.class, Post.class, Work.class };
	    	for (Class<?> toDelete : related)
	    	{
	    		em.createQuery("delete from " + toDelete.getSimpleName() +
	    				" where coder.ID = :coder")
	    			.setParameter("coder", ID)
	    			.executeUpdate();
	    	}
	    	em.createQuery("delete from Coder where ID=:coder")
	    		.setParameter("coder", ID)
	    		.executeUpdate();
	    	
	        em.getTransaction().commit();
	    }
	    catch (PersistenceException ex)
	    {
	        ex.printStackTrace ();
	        if (em.getTransaction().isActive())
	        	em.getTransaction().rollback();
	    }
	    finally
	    {
	        em.close ();
	    }
    }
    
    /**
     * We @JsonIgnore the password in outbound representations.
     * This means we get some PUTs of objects with missing passwords.
     * We need to fix those back up before trying an update. 
     */
    @Override
    public Coder update (Coder modifiedCoder)
    {
    	if (modifiedCoder.getPassword() == null)
    	{
    		User existingCoder = getByID(modifiedCoder.getID());
    		modifiedCoder.setPassword(existingCoder.getPassword());
    	}
    	
    	return super.update(modifiedCoder);
    }

    @Override
    public void remove(Coder coder)
    {
    	cleanUpCoder(coder.getID());
    }
    
    @Override
    public void removeByID(int coderID)
    {
    	cleanUpCoder(coderID);
    }
}
