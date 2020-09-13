package codersclub;

import static org.junit.Assert.assertEquals;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=PersistenceTestConfig.class)
public class TeamServiceTest
{
	public static final int CODER_ID_X1 = 1;
	public static final int CODER_ID_X2 = 2;
	public static final int CODER_ID_Y1 = 3;
	public static final int CODER_ID_Y2 = 4;
	public static final int CODER_ID_Z1 = 5;
	public static final int CODER_ID_Z2 = 6;
	public static final int CODER_ID_NEW = 7;
	
	public static final String PAGE_ID_X = "x";
	public static final String PAGE_ID_Y = "y";
	public static final String PAGE_ID_Z = "z";
	public static final String PAGE_ID_NEW = "new";
	
	public static final String TEAM_CODE_X = "123456";
	public static final String TEAM_CODE_Y = "222222";
	public static final String TEAM_CODE_Z = "654321";
	
    @Autowired
    private TeamService teamService;

    @Autowired
    private CoderService coderService;
    
    @Autowired
    private EntityManagerFactory emf;

    @After
    public void tearDown() {
    	EntityManager em = emf.createEntityManager();
    	em.getTransaction().begin();
    	em.createQuery("delete from TeamMember tm where tm.coder.ID = " + 
    			CODER_ID_Z2).executeUpdate();
    	em.createQuery("delete from TeamMember tm where tm.pageID = '" + 
    			PAGE_ID_NEW + "'").executeUpdate();
    	em.getTransaction().commit();
    	em.close(); 
    }
    
    @Test
    public void testGetTeamX() {
    	List<TeamMember> team = teamService.getTeam
    			(PAGE_ID_X, coderService.getByID(CODER_ID_X1));
    	
    	assertEquals(2, team.size());
    	assertEquals(CODER_ID_X1, team.get(0).getCoder().getID());
    	assertEquals(CODER_ID_X2, team.get(1).getCoder().getID());
    }

    @Test
    public void testGetTeamY() {
    	List<TeamMember> team = teamService.getTeam
    			(PAGE_ID_Y, coderService.getByID(CODER_ID_Y2));
    	
    	assertEquals(2, team.size());
    	assertEquals(CODER_ID_Y1, team.get(0).getCoder().getID());
    	assertEquals(CODER_ID_Y2, team.get(1).getCoder().getID());
    }

    @Test
    public void testGetTeamNone() {
    	List<TeamMember> team = teamService.getTeam
    			("NoSuchPage", coderService.getByID(CODER_ID_X1));
    	
    	assertEquals(0, team.size());
    }
    
    @Test
    public void testCreateTeam() {
    	teamService.createTeam(PAGE_ID_NEW, coderService.getByID(CODER_ID_NEW));

    	EntityManager em = emf.createEntityManager();
    	assertEquals(1, em.createQuery("select tm from TeamMember tm where tm.pageID = '" + PAGE_ID_NEW + "'", 
    			TeamMember.class).getResultList().size());
    	em.close();
    }
    
    @Test(expected=IllegalStateException.class)
    public void testCreateSecondTeam() {
    	teamService.createTeam(PAGE_ID_X, coderService.getByID(CODER_ID_X1));
    }
    
    @Test
    public void testJoinTeam() {
    	EntityManager em = emf.createEntityManager();
    	assertEquals(1, em.createQuery("select tm from TeamMember tm where "
    			+ "tm.teamCode = '" + TEAM_CODE_Z + "'", 
    			TeamMember.class).getResultList().size());
    	em.close();

    	teamService.joinTeam(TEAM_CODE_Z, coderService.getByID(CODER_ID_Z2));

    	em = emf.createEntityManager();
    	assertEquals(1, em.createQuery("select tm from TeamMember tm where "
    			+ "tm.teamCode = '" + TEAM_CODE_Z + "' and "
    			+ "tm.pageID = '" + PAGE_ID_Z + "' and " 
    			+ "tm.coder.ID = " + CODER_ID_Z2, 
    			TeamMember.class).getResultList().size());
    	em.close();
    }
    
    @Test(expected=IllegalStateException.class)
    public void testJoinOwnTeam() {
    	teamService.joinTeam(TEAM_CODE_Z, coderService.getByID(CODER_ID_Z1));
    }
    
    @Test(expected=IllegalArgumentException.class)
    public void testJoinNoSuchTeam() {
    	teamService.joinTeam("NoSuchCode", coderService.getByID(CODER_ID_Z2));
    }
}
