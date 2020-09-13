package codersclub;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.db.JPAService;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=PersistenceTestConfig.class)
public class CoderLifecycleTest
{
    @Autowired
    private EntityManagerFactory emf;
    
    @Autowired
    private JPAService<Club> clubService;
    
    @Autowired
    private CoderService coderService;
    
    @Autowired
    private UserService<Staff> coachService;
    
    @Autowired
    private JPAService<Activity> activityService;

    @Autowired
    private JPAService<CompletedActivity> completedActivityService;

    @Autowired
    private JPAService<CompletedLevel> completedLevelService;

    @Before
    @After
    public void cleanSlate ()
    {
        EntityManager em = null;
        try
        {
            em = emf.createEntityManager ();
            em.getTransaction ().begin ();
            em.createQuery ("delete from CompletedActivity ca where ca.coder.lastName = 'Flintstone'").executeUpdate ();
            em.createQuery ("delete from CompletedLevel cl where cl.coder.lastName = 'Flintstone'").executeUpdate ();
            em.createQuery ("delete from Coder c where c.lastName='Flintstone'");
            
            em.getTransaction ().commit ();
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        emf.getCache ().evictAll ();
    }
    
    @Test
    public void testCreateAndDeleteCoder ()
        throws Exception
    {
        Club club = clubService.getByID (1);
        Coder fred = new Coder 
            (club, "Fred", "Flintstone", "password", "fred@bedrock.gov");
        coderService.add (fred);
        
        Staff willProvost = coachService.getByKey ("lastName", "Provost");
        Activity sproutOctagon = activityService.getByKey ("name", "Octagon");
        Activity sproutBorder = activityService.getByKey ("name", "Decorative Border");
        Activity blocklyMaze = activityService.getByKey ("group.ID", 2);
            
        CompletedActivity sallyDidSproutOctagon = new CompletedActivity
            (fred, sproutOctagon, null, willProvost.getName ());
        CompletedActivity sallyDidSproutBorder = new CompletedActivity
            (fred, sproutBorder, null, willProvost.getName ());
        CompletedActivity sallyDidBlockly1 = new CompletedActivity
            (fred, blocklyMaze, 1, willProvost.getName ());
        CompletedActivity sallyDidBlockly2 = new CompletedActivity
            (fred, blocklyMaze, 2, willProvost.getName ());

        completedActivityService.add (sallyDidSproutOctagon);
        completedActivityService.add (sallyDidSproutBorder);
        completedActivityService.add (sallyDidBlockly1);
        completedActivityService.add (sallyDidBlockly2);
        
        completedLevelService.add (new CompletedLevel 
            (fred, sproutOctagon.getLevel (), willProvost.getName ()));
        
        coderService.remove(fred);
    }
    
    @Test(expected=IllegalArgumentException.class)
    public void testDeleteNonExistentCoder ()
        throws Exception
    {
        coderService.removeByID(999);
    }
}
