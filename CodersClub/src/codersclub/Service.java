package codersclub;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.NoResultException;
import javax.persistence.TypedQuery;

import org.springframework.beans.factory.annotation.Autowired;

import codersclub.History.ActiveLevel;

public class Service
{
    private EntityManagerFactory emf;
    
    @Autowired
    private CoderService coderService;
    
    public static class Belt
    {
    	public Integer earned;
    	public long points;
    }
    
    public static class Progress
    {
    	public int ID;
        public String firstName;
        public String lastName;
        public String parentEMail;
        public String group;
        public List<Belt> belts;
    }
    
    public Service (EntityManagerFactory emf)
    {
        this.emf = emf;
    }
    
    public Level getHighestCompletedLevel (int coderID)
    {
        EntityManager em = null;
        List<CompletedLevel> completedLevels = null;
        try
        {
            em = emf.createEntityManager ();
            completedLevels = em.createQuery 
                ("select cl from CompletedLevel cl " +
                 "where cl.coder.ID = :coder order by cl.level.number desc", 
                    CompletedLevel.class)
                .setParameter ("coder", coderID)
                .getResultList ();
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        return completedLevels.size () != 0 
            ? completedLevels.get (0).getLevel () 
            : Level.LEVEL_ZERO;
    }
   
    public CompletedLevel getCompletedLevel (int coderID, int levelNumber)
    {
        EntityManager em = null;
        CompletedLevel completedLevel = null;
        try
        {
            em = emf.createEntityManager ();
            completedLevel = em.createQuery 
                ("select cl from CompletedLevel cl " +
                 "where cl.coder.ID = :coder and cl.level.number = :number", 
                    CompletedLevel.class)
                .setParameter ("coder", coderID)
                .setParameter ("number", levelNumber)
                .getSingleResult ();
        }
        catch (NoResultException ex)
        {
            return null;
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        return completedLevel;
    }
    
    public boolean hasCoderCompletedLevel (int coderID, int levelNumber)
    {
        return getCompletedLevel (coderID, levelNumber) != null;
    }
    
    public CompletedActivity getCompletedActivity (int coderID, int activityID)
    {
        EntityManager em = null;
        CompletedActivity completedActivity = null;
        String queryString = "select ca from CompletedActivity ca " +
            "where ca.coder.ID = :coder and ca.activity.ID = :activity"; 
        try
        {
            em = emf.createEntityManager ();
            TypedQuery<CompletedActivity> query = em.createQuery 
                (queryString, CompletedActivity.class);
            query.setParameter ("coder", coderID);
            query.setParameter ("activity", activityID);
            
            completedActivity = query.getSingleResult ();
        }
        catch (NoResultException ex)
        {
            return null;
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        return completedActivity;
    }
    
    private History getHistory (EntityManager em, Coder coder)
    {
        History history  = new History ();
        history.setCoder (coder);
        
        Iterator<CompletedActivity> completedActivities = em.createQuery 
            ("select comp from CompletedActivity comp " +
                "where comp.coder.ID = :ID " +
                "order by comp.activity.level.number, comp.activity.ordinal, " +
                        "comp.activity.step, comp.dateCompleted", 
                    CompletedActivity.class)
            .setParameter ("ID", coder.getID ())
            .getResultList ().iterator ();
        CompletedActivity completedActivity = completedActivities.hasNext () 
            ? completedActivities.next () : null;
        
        Map<Integer,CompletedLevel> completedLevels = new HashMap<> ();
        for (CompletedLevel completedLevel : em.createQuery 
            ("select comp from CompletedLevel comp where comp.coder.ID = :ID", 
                CompletedLevel.class)
            .setParameter ("ID", coder.getID ())
            .getResultList ())
        {
            completedLevels.put(completedLevel.getLevel ().getNumber (), 
                completedLevel);
        }
        
        int maxLevel = em.createQuery 
            ("select max(level.number) from Level level", Integer.class)
                .getSingleResult ();

        for (int level = 1; level <= maxLevel; ++level)
        {
            ActiveLevel activeLevel = new ActiveLevel ();
            
            if (completedLevels.containsKey (level))
            {
                CompletedLevel completedLevel = completedLevels.get (level);
                activeLevel.setLevel (completedLevel.getLevel ());
                activeLevel.setCompleted (true);
                activeLevel.setExplanation (completedLevel.getExplanation ());
            }
            else  if (completedActivity != null &&
                completedActivity.getActivity ().getLevel ().getNumber () == level)
            {
                activeLevel.setLevel (completedActivity.getActivity ().getLevel ());
            }
            else continue; // nothing to say at this level
            
            while (completedActivity != null &&
                completedActivity.getActivity ().getLevel ().getNumber () == level)
            {
                activeLevel.getCompletedActivities ().add (completedActivity);
                completedActivity = completedActivities.hasNext () 
                    ? completedActivities.next () : null;
            }
            
            history.getActiveLevels ().add (activeLevel);
        }
        
        return history;
    }
    
    public History getHistory (String firstName, String lastName)
    {
        EntityManager em = null;
        History history = null;
        try
        {
            em = emf.createEntityManager ();
            Coder coder = em.createQuery ("select c from Coder c " +
                "where c.firstName = :first and c.lastName = :last", 
                    Coder.class)
                .setParameter ("first", firstName)
                .setParameter ("last", lastName)
                .getSingleResult ();
            
            history = getHistory (em, coder);
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        return history;
    }
    
    public History getHistory (Coder coder)
    {
        EntityManager em = null;
        History history = null;
        try
        {
            em = emf.createEntityManager ();
            history = getHistory (em, coder);
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        return history;
    }
    
    public List<Progress> getProgress(Club club)
    {
    	final int CODER_ID_INDEX = 0;
    	final int LEVEL_NUMBER_INDEX = 3;
    	final int POINTS_INDEX = 4;
    	final int DATE_COMPLETED_INDEX = 4;
    	
    	List<Coder> coders = coderService.getAllByClub(club);
    	List<Progress> result = new ArrayList<>();
    			
        EntityManager em = null;
        try
        {
            em = emf.createEntityManager ();
            
            int topLevel = em.createQuery
            		("select max(lvl.number) from Level lvl", Integer.class)
            	.getSingleResult();
            
            Iterator<Object[]> ca = em.createQuery
            		("select ca.coder.ID, ca.coder.lastName, ca.coder.firstName, ca.activity.level.number, sum(ca.activity.points) " + 
            				"from CompletedActivity ca " + 
            				"where ca.coder.club.ID = :club " + 
            				"group by ca.coder.ID, ca.coder.lastName, ca.coder.firstName, ca.activity.level.number " + 
            				"order by ca.coder.lastName, ca.coder.firstName, ca.activity.level.number",
            		 Object[].class)
        		.setParameter("club", club.getID())
        		.getResultList()
        		.iterator();
            Object[] currentCA = ca.hasNext() ? ca.next() : null;
            
            Iterator<Object[]> cl = em.createQuery
            		("select cl.coder.ID, cl.coder.lastName, cl.coder.firstName, cl.level.number, cl.dateCompleted " + 
            				"from CompletedLevel cl " + 
            				"where cl.coder.club.ID = :club " + 
            				"order by cl.coder.lastName, cl.coder.firstName, cl.level.number", 
            		 Object[].class)
        		.setParameter("club", club.getID())
        		.getResultList()
        		.iterator();
            Object[] currentCL = cl.hasNext() ? cl.next() : null;
            
            for (Coder coder: coders)
            {
            	Progress progress = new Progress();
            	progress.ID = coder.getID();
            	progress.firstName = coder.getFirstName();
            	progress.lastName = coder.getLastName();
            	progress.parentEMail = coder.getParentEMail();
            	progress.group = coder.getGroup();
            	progress.belts = new ArrayList<>();
            	
            	for (int level = 1; level <= topLevel; ++level)
            	{
            		Belt belt = new Belt();
            		
            		if (currentCA != null &&
            				(Integer) currentCA[CODER_ID_INDEX] == coder.getID() && 
            				(Integer) currentCA[LEVEL_NUMBER_INDEX] == level)
            		{
            			belt.points = (Long) currentCA[POINTS_INDEX];
            			currentCA = ca.hasNext() ? ca.next() : null;
            		}
            		
            		if (currentCL != null &&
            				(Integer) currentCL[CODER_ID_INDEX] == coder.getID() && 
            				(Integer) currentCL[LEVEL_NUMBER_INDEX] == level)
            		{
            			Date dateCompleted = (Date) currentCL[DATE_COMPLETED_INDEX];
            			SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMdd");
            			belt.earned = Integer.parseInt(formatter.format(dateCompleted));
            			
            			currentCL = cl.hasNext() ? cl.next() : null;
            		}
            		
            		progress.belts.add(belt);
            	}
            	
            	result.add(progress);
            }
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        return result;
    }
}
