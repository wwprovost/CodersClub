package codersclub;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.NoResultException;

import codersclub.db.JPAService;

public class WorkService
    extends JPAService<Work>
{
    public WorkService (EntityManagerFactory emf)
    {
        super (emf, Work.class, "coder.ID, pageID");
    }

    /**
     * Returns an empty string if nothing has been stored yet.
     */
    public String getWork (Coder coder, String pageID)
    {
        EntityManager em = null;
        Work work = null;
        try
        {
            em = emf.createEntityManager ();
            work = em.createQuery ("select w from Work w "
                + "where w.coder.ID = :coderID and w.pageID = :pageID", 
                Work.class)
                .setParameter ("coderID", coder.getID ())
                .setParameter ("pageID", pageID)
                .getSingleResult ();
        }
        catch (NoResultException ex)
        {
            return "";
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        return work.getCode ();
    }

    /**
     * Returns true if new work created, false if updated.
     */
    public Work updateOrInsertWork (Coder coder, String pageID, String code)
    {
        EntityManager em = null;
        Work result = null;
        try
        {
            em = emf.createEntityManager ();
            em.getTransaction ().begin ();

            List<Work> existingWork = em.createQuery ("select w from Work w "
                + "where w.coder.ID = :coderID and w.pageID = :pageID", 
                Work.class)
                .setParameter ("coderID", coder.getID ())
                .setParameter ("pageID", pageID)
                .getResultList ();
            if (existingWork.size() != 0)
            {
                result = existingWork.get(0);
                result.setCode (code);
                result.refreshDate();
            }
            else
            {
            	result = new Work ();
            	result.setCoder(coder);
            	result.setPageID (pageID);
            	result.setCode(code);
                
                em.persist (result);
            }
            
            em.getTransaction ().commit ();
        }
        finally
        {
            if (em.getTransaction ().isActive ())
                em.getTransaction ().rollback ();
            
            if (em != null)
                em.close ();
        }
        
        return result;
    }

    /**
     * Returns the page ID most recently visited by the given coder.
     */
    public String getLatestActivity (Coder coder, Date since)
    {
        EntityManager em = null;
        List<String> pageIDs = null;
        try
        {
            em = emf.createEntityManager ();
            pageIDs = em.createQuery ("select w.pageID from Work w "
                + "where w.coder.ID = :coderID and w.pageID not like '%:language' and w.when > :since "
                + "order by w.when desc", 
                String.class)
                .setParameter ("coderID", coder.getID ())
                .setParameter ("since", since)
                .getResultList ();
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        return pageIDs.isEmpty() ? null : pageIDs.get(0);
    }

    /**
     * Returns a list of all unique programs for this page ID,
     * <strong>except</strong> that of the given coder.
     * 
     * @param coder Coder to skip, or null to get all work with no exclusions
     * @param pageID The page ID of interest
     */
    public List<String> getAllWork (Coder coder, String pageID)
    {
        EntityManager em = null;
        List<String> result = null;
        try
        {
            em = emf.createEntityManager ();
            result = em.createQuery ("select distinct w.code from Work w "
                + "where w.coder.ID != :coderID and w.pageID = :pageID", 
                String.class)
                .setParameter ("coderID", coder != null ? coder.getID () : -1)
                .setParameter ("pageID", pageID)
                .getResultList ();
        }
        catch (NoResultException ex)
        {
            return new ArrayList<>();
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        return result;
    }
}
