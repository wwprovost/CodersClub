package codersclub;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.db.CRUDService;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=PersistenceTestConfig.class)
public class StaffServiceTest
{
    private Club pierce;
    private Club lawrence;
    
    @Autowired
    private CRUDService<Club> clubService;
    
    @Autowired
    private StaffService staffService;
    
    @Before
    public void getClubs() 
    {
        pierce = clubService.getByID (1);
        lawrence = clubService.getByID (2);
    }
    
    @Test
    public void testGetByClubAndNameCoach ()
        throws Exception
    {
        Staff staff = staffService.getByClubAndName (pierce, "Stephen", "Intille");
        assertEquals("Stephen", staff.getFirstName());
        assertEquals("Intille", staff.getLastName());
        assertTrue(staff.isCoach());
        assertFalse(staff.isAdmin());
        assertFalse(staff.isSenior());
        assertEquals("int", staff.getEMail ());
    }
    
    @Test
    public void testGetByClubAndNameAdmin ()
        throws Exception
    {
        Staff staff = staffService.getByClubAndName (lawrence, "Kirsten", "Alper");
        assertEquals("Kirsten", staff.getFirstName());
        assertEquals("Alper", staff.getLastName());
        assertFalse(staff.isCoach());
        assertTrue(staff.isAdmin());
        assertFalse(staff.isSenior());
        assertEquals("alper", staff.getEMail ());
    }
    
    @Test
    public void testGetByClubAndNameSenior ()
        throws Exception
    {
        Staff staff = staffService.getByClubAndName (lawrence, "Harold", "Price");
        assertEquals("Harold", staff.getFirstName());
        assertEquals("Price", staff.getLastName());
        assertTrue(staff.isCoach());
        assertTrue(staff.isAdmin());
        assertTrue(staff.isSenior());
        assertEquals("harold", staff.getEMail ());
    }
    
    @Test
    public void testGetByClubAndNameMissing ()
        throws Exception
    {
        assertNull(staffService.getByClubAndName (lawrence, "none", "such"));
    }
    
    @Test
    public void testGetAllCoaches() {
    	List<Staff> coaches = staffService.getAllCoaches(pierce);
    	assertEquals(3, coaches.size());
    }
    
    @Test
    public void testGetAllAdmins() {
    	List<Staff> coaches = staffService.getAllAdmins(pierce);
    	assertEquals(3, coaches.size());
    }
    
    @Test
    public void testGetAllSeniors() {
    	List<Staff> coaches = staffService.getAllSeniors(pierce);
    	assertEquals(2, coaches.size());
    }
}
