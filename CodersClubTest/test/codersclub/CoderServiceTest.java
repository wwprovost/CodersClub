package codersclub;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.db.CRUDService;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=PersistenceTestConfig.class)
public class CoderServiceTest
{
    private Club pierce;
    private Club lawrence;
    private Club doom;
    
    @Autowired
    private CRUDService<Club> clubService;
    
    @Autowired
    private CoderService coderService;
    
    @Autowired
    private EntityManagerFactory emf;
    
    @Before
    public void getClubs() 
    {
        pierce = clubService.getByID (1);
        lawrence = clubService.getByID (2);
        doom = clubService.getByID (4);
    }
    
    @Test
    public void testGetByClubAndNamePierce ()
        throws Exception
    {
        Coder coder = coderService.getByClubAndName (pierce, "pierce", "user1");
        assertEquals("pierce", coder.getFirstName());
        assertEquals("user1", coder.getLastName());
        assertEquals("parent1@gmail.com", coder.getParentEMail ());
    }
    
    @Test
    public void testGetByClubAndNameLawrence ()
        throws Exception
    {
        Coder coder = coderService.getByClubAndName (lawrence, "lawrence", "user1");
        assertEquals("lawrence", coder.getFirstName());
        assertEquals("user1", coder.getLastName());
        assertEquals("parent@gmail.com", coder.getParentEMail ());
    }
    
    @Test
    public void testGetByClubAndNamePierce2 ()
        throws Exception
    {
        Coder coder = coderService.getByClubAndName (pierce, "pierce", "user2");
        assertEquals("pierce", coder.getFirstName());
        assertEquals("user2", coder.getLastName());
        assertEquals("parent2@gmail.com", coder.getParentEMail ());
    }
    
    @Test
    public void testGetByClubAndNameLawrence2 ()
        throws Exception
    {
        assertNull(coderService.getByClubAndName (lawrence, "lawrence", "user2"));
    }
    
    @Test
    public void testExistsPierce ()
        throws Exception
    {
        assertTrue(coderService.exists (pierce, "pierce", "user2"));
    }
    
    @Test
    public void testExistsLawrence ()
        throws Exception
    {
        assertFalse(coderService.exists (lawrence, "lawrence", "user2"));
    }
    
    @Test
    public void testGetClubOfCodersPierce ()
        throws Exception
    {
        List<Coder> coders = coderService.getAllByClub(pierce);
        assertEquals(6, coders.size());
    }
    
    @Test
    public void testGetClubOfCodersLawrence ()
        throws Exception
    {
        List<Coder> coders = coderService.getAllByClub(lawrence);
        assertEquals(1, coders.size());
    }
    
    @Test
    public void testGetClubOfCodersNoSuchClub ()
        throws Exception
    {
        Club noneSuch = new Club("", "");
        noneSuch.setID(0);
        
        List<Coder> coders = coderService.getAllByClub(noneSuch);
        assertEquals(0, coders.size());
    }
    
    @Test
    public void testGetGroupsPierce ()
        throws Exception
    {
        List<String> groups = coderService.getGroups(pierce);
        assertEquals(3, groups.size());
        assertEquals("AAA Group", groups.get(0));
    }
    
    @Test
    public void testGetGroupsLawrence ()
        throws Exception
    {
        List<String> groups = coderService.getGroups(lawrence);
        assertEquals(1, groups.size());
    }
    
    @Test
    public void testGetGroupsOfCodersPierce ()
        throws Exception
    {
        Map<String,List<Coder>> groups = coderService.getGroupsOfCoders(pierce);
        assertEquals(3, groups.size());
        for (String group : groups.keySet())
        {
            assertEquals("AAA Group", group);
            break;
        }
        
        assertEquals("auser4", groups.get ("Group 1").get(0).getLastName());
        assertFalse(groups.get("Group 1").get(0).isOverdue()); // not enough points
        assertFalse(groups.get("Group 1").get(1).isOverdue()); // awarded white belt
        assertTrue(groups.get("Group 1").get(2).isOverdue()); // overdue for a white belt

    }
    
    @Test
    public void testGetGroupOfCodersPierceGroup1 ()
        throws Exception
    {
        List<Coder> group = coderService.getGroupOfCoders(pierce, "Group 1");
        assertEquals(3, group.size());
        assertEquals("auser4", group.get(0).getLastName());
        assertFalse(group.get(0).isOverdue()); // not enough points
        assertFalse(group.get(1).isOverdue()); // awarded white belt
        assertTrue(group.get(2).isOverdue()); // overdue for a white belt
    }

    
    public static void assertGroupsClearedAndRestore(EntityManagerFactory emf)
    {
        EntityManager em = null;
        try
        {
        	em = emf.createEntityManager();
	        assertEquals(4, em.createQuery
	        		("select count(c) from Coder c where c.club.ID=4 and c.group is null", 
	        				Long.class)
	        		.getSingleResult().intValue());
	        assertEquals(0, em.createQuery
	        		("select count(c) from Coder c where c.club.ID=4 and c.group is not null", 
	        				Long.class)
	        		.getSingleResult().intValue());
        }
        finally
        {
        	String[] groups = { "Group 1", "Group 1", "Group 2" };
        	em.getTransaction().begin();
        	for (int number = 1; number < 4; ++number) 
        	{
        		em.createQuery
        			("update Coder c set c.group=:group where c.club.ID=4 and c.lastName=:name")
        			.setParameter("group", groups[number - 1])
        			.setParameter("name", "user" + number)
        			.executeUpdate();
        	}
        	em.getTransaction().commit();
        	
        	em.close();
        }
    }
    
    @Test
    public void testClearGroups ()
        throws Exception
    {
        coderService.clearGroups(doom);
        assertGroupsClearedAndRestore(emf);
    }
}
