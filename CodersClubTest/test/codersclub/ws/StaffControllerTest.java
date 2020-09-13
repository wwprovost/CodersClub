package codersclub.ws;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.AuthnTest;
import codersclub.Club;
import codersclub.Coder;
import codersclub.Service;
import codersclub.ServiceTest;
import codersclub.Staff;
import codersclub.UserService;
import codersclub.WorkService;
import codersclub.db.JPAService;
import codersclub.ex.AuthenticationFailure;
import codersclub.ex.AuthorizationFailure;
import codersclub.ex.InadequatePassword;
import codersclub.ex.InvalidEMail;
import codersclub.ex.NotInYourClub;
import codersclub.ws.StaffController.AttendanceRecord;
import codersclub.ws.StaffController.BeltAward;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=WSTestConfig.class)
public class StaffControllerTest
{
	public static final int STAFF_CLUB = 3;
	public static final String STAFF_FIRST = "Test";
	public static final String STAFF_LAST = "Staff";
	public static final String STAFF_PASSWORD = "password";
	public static final String NEW_PASSWORD = "Nice3choice!";
	
	public static final String USERNAME_TEST_STAFF = "" + STAFF_CLUB + "_" + 
			STAFF_FIRST + "_" + STAFF_LAST;
	
	public static final String USERNAME_PIERCE_COACH = "1_Will_Provost";
	public static final String USERNAME_LAWRENCE_COACH = "2_Harold_Price";
	public static final String USERNAME_DEVO_COACH = "3_Phil_Durbin";
	public static final String USERNAME_DOOM_COACH = "4_Doctor_Doom";
	public static final String USERNAME_ACTIVITY_CODER = "2_lawrence_user1";
	
	public static final String ATTENDED_FROM = "2018-04-04";
	public static final String ATTENDED_TO = "2018-05-15";
	
	public static final String CODER_1_FIRST = "pierce";
	public static final String CODER_1_LAST = "user1";
	public static final String CODER_1_GROUP = "Group 1";
	public static final String CODER_2_FIRST = "pierce";
	public static final String CODER_2_LAST = "user2";
	public static final String CODER_2_GROUP = "Group 1";

	public static final int ACTIVITY_CODER_ID = 7;
	
    @Autowired
    private StaffController controller;
    
    @Autowired
    private JPAService<Club> clubService;
    
    @Autowired
    private UserService<Staff> staffService;

    @Autowired
    private WorkController workController;

    private Club club;
    private int staffID;
    private SimpleDateFormat parser = new SimpleDateFormat("M/d/yy");
    
    public static void assertCoders1and2(List<AttendanceRecord> records)
    {
    	assertEquals(2, records.size());

    	assertEquals(CODER_1_FIRST, records.get(0).first);
    	assertEquals(CODER_1_LAST, records.get(0).last);
    	assertEquals(CODER_1_GROUP, records.get(0).group);

    	assertEquals(CODER_2_FIRST, records.get(1).first);
    	assertEquals(CODER_2_LAST, records.get(1).last);
    	assertEquals(CODER_2_GROUP, records.get(1).group);
    }

    @Before
    public void createTestStaff() 
    {
    	club = clubService.getByID(STAFF_CLUB);
    	AuthnTest.username = USERNAME_TEST_STAFF;
    	
		Staff staff = new Staff(club, STAFF_FIRST, STAFF_LAST, STAFF_PASSWORD);
		staffService.add(staff);
		staffID = staff.getID();
    }
    
    @After
    public void dropTestStaff()
    {
    	staffService.removeByID(staffID);
    }
    
    @Test
    public void testWhoAmI()
    {
    	Staff staff = controller.whoAmI();
    	assertEquals(STAFF_FIRST + " " + STAFF_LAST, staff.getName());
    }
    
    @Test(expected=AuthorizationFailure.class)
    public void testWhoAmIAuthorization()
    {
    	AuthnTest.username = "1_pierce_user1";
    	controller.whoAmI();
    }
    
    @Test
    public void testChangeEMail()
    {
    	String newEMail = "a@a.com";
    	controller.changeProfile(newEMail);
    	assertEquals(newEMail, staffService.getByID(staffID).getEMail());
    }
    
    @Test(expected=InvalidEMail.class)
    public void testNoEMail()
    {
    	String newEMail = "";
    	controller.changeProfile(newEMail);
    }
    
    @Test(expected=InvalidEMail.class)
    public void testBadEMail()
    {
    	String newEMail = "aaa";
    	controller.changeProfile(newEMail);
    }
    
    @Test
    public void testChangePassword()
    {
    	String newPassword = NEW_PASSWORD;
    	controller.changePassword(STAFF_PASSWORD, newPassword);
    	assertEquals(newPassword, staffService.getByID(staffID).getPassword());
    }

    @Test
    public void testBadOldPassword()
    {
    	String newPassword = NEW_PASSWORD;
    	try 
    	{
    		controller.changePassword("Incorrect", newPassword);
    		fail("Should have rejected incorrect old password.");
    	}
    	catch(AuthenticationFailure ex)
    	{
    		assertEquals(STAFF_PASSWORD, staffService.getByID(staffID).getPassword());
    	}
    }
    
    @Test
    public void testNoOldPassword()
    {
    	String newPassword = NEW_PASSWORD;
    	try 
    	{
    		controller.changePassword(null, newPassword);
    		fail("Should have rejected missing old password.");
    	}
    	catch(AuthenticationFailure ex)
    	{
    		assertEquals(STAFF_PASSWORD, staffService.getByID(staffID).getPassword());
    	}
    }
    
    @Test
    public void testNoPassword()
    {
    	try 
    	{
    		controller.changePassword(STAFF_PASSWORD, null);
    		fail("Should have rejected missing new password.");
    	}
    	catch(InadequatePassword ex)
    	{
    		assertEquals(STAFF_PASSWORD, staffService.getByID(staffID).getPassword());
    	}
    }
    
    @Test
    public void testEmptyPassword()
    {
    	try 
    	{
    		controller.changePassword(STAFF_PASSWORD, "");
    		fail("Should have rejected missing new password.");
    	}
    	catch(InadequatePassword ex)
    	{
    		assertEquals(STAFF_PASSWORD, staffService.getByID(staffID).getPassword());
    	}
    }
    
    @Test
    public void testShortPassword()
    {
    	try 
    	{
    		controller.changePassword(STAFF_PASSWORD, "Aa1");
    		fail("Should have rejected missing new password.");
    	}
    	catch(InadequatePassword ex)
    	{
    		assertEquals(STAFF_PASSWORD, staffService.getByID(staffID).getPassword());
    	}
    }
    
    @Test
    public void testNoDigitPassword()
    {
    	try 
    	{
    		controller.changePassword(STAFF_PASSWORD, "Absolutely");
    		fail("Should have rejected missing new password.");
    	}
    	catch(InadequatePassword ex)
    	{
    		assertEquals(STAFF_PASSWORD, staffService.getByID(staffID).getPassword());
    	}
    }
    
    @Test
    public void testNoLowercasePassword()
    {
    	try 
    	{
    		controller.changePassword(STAFF_PASSWORD, "fiveand5");
    		fail("Should have rejected missing new password.");
    	}
    	catch(InadequatePassword ex)
    	{
    		assertEquals(STAFF_PASSWORD, staffService.getByID(staffID).getPassword());
    	}
    }
    
    @Test
    public void testNoUppercasePassword()
    {
    	try 
    	{
    		controller.changePassword(STAFF_PASSWORD, "ALL5UPPERCASE");
    		fail("Should have rejected missing new password.");
    	}
    	catch(InadequatePassword ex)
    	{
    		assertEquals(STAFF_PASSWORD, staffService.getByID(staffID).getPassword());
    	}
    }

    @Test
    public void testGetCoders() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
        List<Coder> coders = controller.getCoders();
        assertEquals(6, coders.size());
        Coder coder = coders.get (1); // 'auser4' first in alpha order
        assertEquals ("user1", coder.getLastName());
    }
    
    
    @Test
    public void testGetAttendanceFromAndTo()
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	List<AttendanceRecord> result = controller.getAttendance(ATTENDED_FROM, ATTENDED_TO);
    	
    	assertCoders1and2(result);
    	assertEquals(4, result.get(0).attendance.size());
    	assertEquals(5, result.get(1).attendance.size());
    }
    
    @Test
    public void testGetAttendanceFrom()
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	List<AttendanceRecord> result = controller.getAttendance(ATTENDED_FROM, null);
    	
    	assertCoders1and2(result);
    	assertEquals(4, result.get(0).attendance.size());
    	assertEquals(6, result.get(1).attendance.size());
    }
    
    @Test
    public void testGetAttendanceTo()
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	List<AttendanceRecord> result = controller.getAttendance(null, ATTENDED_TO);
    	
    	assertCoders1and2(result);
    	assertEquals(8, result.get(0).attendance.size());
    	assertEquals(5, result.get(1).attendance.size());
    }
    
    @Test
    public void testGetAttendanceForever()
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	List<AttendanceRecord> result = controller.getAttendance(null, null);
    	
    	assertCoders1and2(result);
    	assertEquals(8, result.get(0).attendance.size());
    	assertEquals(6, result.get(1).attendance.size());
    }

    @Test
    public void testGetProgress()
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	List<Service.Progress> progress = controller.getProgress();
    	ServiceTest.assertProgress(progress);
    }
    
    @Test
    @SuppressWarnings("unchecked")
    public void testGetBeltAwards()
    {
    	ResponseEntity<?> response = controller.getBeltAwards("2018-01-01");
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	
    	List<BeltAward> result = (List<BeltAward>) response.getBody();
    	assertEquals(1, result.size());
    }
    
    @Test
    @SuppressWarnings("unchecked")
    public void testGetBeltAwardsNone()
    {
    	ResponseEntity<?> response = controller.getBeltAwards("2019-01-01");
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	
    	List<BeltAward> result = (List<BeltAward>) response.getBody();
    	assertEquals(0, result.size());
    }
    
    @Test
    @SuppressWarnings("unchecked")
    public void testGetBeltAwardsForever()
    {
    	ResponseEntity<?> response = controller.getBeltAwards(null);
    	assertEquals(HttpStatus.OK, response.getStatusCode());
    	
    	List<BeltAward> result = (List<BeltAward>) response.getBody();
    	assertEquals(1, result.size());
    }
    
    @Test
    public void testGetBeltAwardsBadDateFormat()
    {
    	ResponseEntity<?> response = controller.getBeltAwards("Bad format");
    	assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
    
    @Test
    public void testGetCertificatesForCoder() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
        List<StaffController.Certificate> certificates = 
        		controller.getCertificateForCoder(1);
        assertEquals(1, certificates.size());
        StaffController.Certificate certificate = certificates.get (0);
        assertEquals ("pierce", certificate.name);
        assertEquals("white", certificate.beltColor);
    }
    
    @Test(expected=NotInYourClub.class)
    public void testGetCertificatesForCoderInAnotherClub() 
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
        controller.getCertificateForCoder(1);
    }
    
    @Test
    public void testGetCertificatesForGroup_Pierce() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
        List<StaffController.Certificate> certificates = 
        		controller.getCertificatesForGroup("Group 1");
        assertEquals(3, certificates.size());
        StaffController.Certificate certificate = certificates.get (1); // 'auser4' first in alpha order
        assertEquals ("pierce", certificate.name);
        assertEquals("white", certificate.beltColor);
    }
    
    @Test
    public void testGetCertificatesForGroup_Devo() 
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
    	List<StaffController.Certificate> certificates = 
    			controller.getCertificatesForGroup ("Group 1");
        assertEquals(1, certificates.size());
        StaffController.Certificate certificate = certificates.get (0); 
        assertEquals ("devo", certificate.name);
        assertNull(certificate.beltColor);
    }
    
    @Test
    public void testGetCertificatesForActiveCoders() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
        List<StaffController.Certificate> certificates = 
        		controller.getCertificatesForActiveCoders();
        assertEquals(5, certificates.size());
    }
    
    public void assertURLForDate(String pageID, String URL)
    {
    	AuthnTest.username = USERNAME_ACTIVITY_CODER;
    	workController.putWork(pageID, "X");
    	
    	AuthnTest.username = USERNAME_LAWRENCE_COACH;
    	HttpSession mockSession = mock(HttpSession.class);
    	when(mockSession.getCreationTime()).thenReturn(0L);
		assertEquals(URL, controller.getActivity(ACTIVITY_CODER_ID, mockSession).location);
    }
    
    @Test
    public void testGetActivityAllegro()
    {
    	assertURLForDate("Allegro:Page1", "Allegro/Page1.html");
    }
    
    @Test
    public void testGetActivityBaseball()
    {
    	assertURLForDate("Baseball:Page1", "Baseball/Page1.html");
    }
    
    @Test
    public void testGetActivityBlocklyMaze()
    {
    	assertURLForDate("BlocklyMaze:Page1", "BlocklyMaze/maze.html");
    }
    
    @Test
    public void testGetActivityChutes()
    {
    	assertURLForDate("Chutes:Page1", "Chutes/Page1.html");
    }
    
    @Test
    public void testGetActivityDicey()
    {
    	assertURLForDate("Dicey:Game3Sequence2", "Dicey/Game3.html");
    }
    
    @Test
    public void testGetActivityNumberCrunch()
    {
    	assertURLForDate("NumberCrunch:Page1", "NumberCrunch/Page1.html");
    }
    
    @Test
    public void testGetActivitySecret()
    {
    	assertURLForDate("Secret:Page1", "Secret/Page1.html");
    }
    
    @Test
    public void testGetActivitySprout()
    {
    	assertURLForDate("Sprout:squares", "Sprout/index.html?challenge=squares");
    }
    
    @Test
    public void testGetActivitySproutText()
    {
    	assertURLForDate("SproutText:Bars", "Sprout/Text/index.html?challenge=Bars");
    }
    
    @Test
    public void testGetActivitySproutTextDefault()
    {
    	assertURLForDate("SproutText:default", "Sprout/Text/index.html");
    }
    
    @Test
    public void testGetActivityTetris()
    {
    	assertURLForDate("Tetris:Page1", "Tetris/Page1.html");
    }
    
    @Test
    public void testGetActivityNoActivity()
    {
    	HttpSession mockSession = mock(HttpSession.class);
    	when(mockSession.getCreationTime()).thenReturn(0L);
		assertNull(controller.getActivity(8, mockSession).location);
    }
}
