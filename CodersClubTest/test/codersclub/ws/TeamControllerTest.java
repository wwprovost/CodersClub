package codersclub.ws;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.AuthnTest;
import codersclub.TeamMember;
import codersclub.ex.AuthorizationFailure;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=WSTestConfig.class)
public class TeamControllerTest
{
	public static final String USERNAME_X1 = "1_pierce_user1";
	public static final String USERNAME_X2 = "1_pierce_user2";
	public static final String USERNAME_Y1 = "1_pierce_user3";
	public static final String USERNAME_Y2 = "1_pierce_auser4";
	public static final String USERNAME_Z1 = "1_pierce_user5";
	public static final String USERNAME_Z2 = "1_pierce_user6";
	public static final String USERNAME_COACH = "1_Will_Provost";
	
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
    private TeamController controller;

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
    	AuthnTest.username = USERNAME_X1;
    	List<TeamMember> team = controller.getTeam(PAGE_ID_X, null);
    	
    	assertEquals(2, team.size());
    	assertEquals(CODER_ID_X1, team.get(0).getCoder().getID());
    	assertTrue(team.get(0).isMe());
    	assertEquals(CODER_ID_X2, team.get(1).getCoder().getID());
    	assertFalse(team.get(1).isMe());
    }

    @Test
    public void testGetTeamY() {
    	AuthnTest.username = USERNAME_Y2;
    	List<TeamMember> team = controller.getTeam(PAGE_ID_Y, null);
    	
    	assertEquals(2, team.size());
    	assertEquals(CODER_ID_Y1, team.get(0).getCoder().getID());
    	assertFalse(team.get(0).isMe());
    	assertEquals(CODER_ID_Y2, team.get(1).getCoder().getID());
    	assertTrue(team.get(1).isMe());
    }

    @Test
    public void testGetTeamShadowing() {
    	AuthnTest.username = USERNAME_COACH;
    	List<TeamMember> team = controller.getTeam(PAGE_ID_Y, CODER_ID_Y2);
    	
    	assertEquals(2, team.size());
    	assertEquals(CODER_ID_Y1, team.get(0).getCoder().getID());
    	assertFalse(team.get(0).isMe());
    	assertEquals(CODER_ID_Y2, team.get(1).getCoder().getID());
    	assertTrue(team.get(1).isMe());
    }

    @Test
    public void testGetTeamNone() {
    	AuthnTest.username = USERNAME_X1;
    	assertEquals(0, controller.getTeam("NoSuchPage", null).size());
    }
    
    @Test
    public void testCreateTeam() {
    	AuthnTest.username = USERNAME_X1;
    	controller.createTeam(PAGE_ID_NEW);

    	EntityManager em = emf.createEntityManager();
    	assertEquals(1, em.createQuery("select tm from TeamMember tm where tm.pageID = '" + PAGE_ID_NEW + "'", 
    			TeamMember.class).getResultList().size());
    	em.close();
    }
    
    @Test(expected=TeamController.AlreadyAMember.class)
    public void testCreateSecondTeam() {
    	AuthnTest.username = USERNAME_X1;
    	controller.createTeam(PAGE_ID_X);
    }
    
    @Test(expected=AuthorizationFailure.class)
    public void testCreateTeamShadowing() {
    	AuthnTest.username = USERNAME_COACH;
    	controller.createTeam(PAGE_ID_NEW);
    }
    
    @Test
    public void testJoinTeam() {
    	EntityManager em = emf.createEntityManager();
    	assertEquals(1, em.createQuery("select tm from TeamMember tm where "
    			+ "tm.teamCode = '" + TEAM_CODE_Z + "'", 
    			TeamMember.class).getResultList().size());
    	em.close();

    	AuthnTest.username = USERNAME_Z2;
    	assertEquals(2, controller.joinTeam(TEAM_CODE_Z));

    	em = emf.createEntityManager();
    	assertEquals(1, em.createQuery("select tm from TeamMember tm where "
    			+ "tm.teamCode = '" + TEAM_CODE_Z + "' and "
    			+ "tm.pageID = '" + PAGE_ID_Z + "' and " 
    			+ "tm.coder.ID = " + CODER_ID_Z2, 
    			TeamMember.class).getResultList().size());
    	em.close();
    }
    
    @Test(expected=TeamController.AlreadyAMember.class)
    public void testJoinOwnTeam() {
    	AuthnTest.username = USERNAME_Z1;
    	controller.joinTeam(TEAM_CODE_Z);
    }
    
    @Test(expected=AuthorizationFailure.class)
    public void testJoinTeamShadowing() {
    	AuthnTest.username = USERNAME_COACH;
    	controller.joinTeam(TEAM_CODE_Z);
    }
    
    @Test(expected=TeamController.NoSuchTeam.class)
    public void testJoinNoSuchTeam() {
    	AuthnTest.username = USERNAME_Z2;
    	controller.joinTeam("NoSuchCode");
    }
}
