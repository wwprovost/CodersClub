package codersclub.ws;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import javax.persistence.EntityManagerFactory;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.Activity;
import codersclub.Attendance;
import codersclub.AttendanceService;
import codersclub.AuthnTest;
import codersclub.Club;
import codersclub.Coder;
import codersclub.CoderService;
import codersclub.CoderServiceTest;
import codersclub.CompletedActivity;
import codersclub.CompletedLevel;
import codersclub.Level;
import codersclub.Post;
import codersclub.Staff;
import codersclub.UserService;
import codersclub.Work;
import codersclub.WorkService;
import codersclub.db.JPAService;
import codersclub.ex.AdminSelfDestruction;
import codersclub.ex.NotInYourClub;
import codersclub.ws.AdminController.CoderCandidate;
import codersclub.ws.AdminController.CoderGroup;
import codersclub.ws.AdminController.StaffCandidate;
import codersclub.ws.AdminController.Status;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=WSTestConfig.class)
public class AdminControllerTest
{
	public static final int ID_PIERCE_COACH = 1;
	public static final int ID_DEVO_COACH = 6;
	
	public static final String USERNAME_PIERCE_COACH = "1_Will_Provost";
	public static final String USERNAME_DEVO_COACH = "3_Phil_Durbin";
	public static final String USERNAME_DOOM_COACH = "4_Doctor_Doom";
	
	public static final String ATTENDED_FROM = "2018-04-04";
	public static final String ATTENDED_TO = "2018-05-15";
	
	public static final String CODER_1_FIRST = "pierce";
	public static final String CODER_1_LAST = "user1";
	public static final String CODER_1_GROUP = "Group 1";
	public static final String CODER_2_FIRST = "pierce";
	public static final String CODER_2_LAST = "user2";
	public static final String CODER_2_GROUP = "Group 1";

	@Autowired
    private AdminController controller;
    
    @Autowired
    private EntityManagerFactory emf;
    
    @Autowired
    private JPAService<Club> clubService;
    
    @Autowired
    private CoderService coderService;
    
    @Autowired
    private UserService<Staff> staffService;
    
    @Autowired
    private AttendanceService attendanceService;
    
    @Autowired
    private WorkService workService;
    
    @Autowired
    private JPAService<Post> postService;
    
    @Autowired
    private JPAService<Activity> activityService;
    
    @Autowired
    private JPAService<Level> levelService;
    
    @Autowired
    private JPAService<CompletedActivity> completedActivityService;
    
    @Autowired
    private JPAService<CompletedLevel> completedLevelService;
    
    @Test
    public void testSetCoderNameAndEMail() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	
    	Club pierce = clubService.getByID(1); 
    	Coder testCoder = coderService.add(new Coder(pierce, "TEST", "CODER", "", null));
    	Coder update = new Coder(pierce, "newFirst", "newLast", "", "newEMail@email.net");
    	try
    	{
    		Coder coder = controller.setCoderNameAndEMail(testCoder.getID(), update);
    		assertEquals(update.getFirstName(), coder.getFirstName());
    		assertEquals(update.getLastName(), coder.getLastName());
    		assertEquals(update.getParentEMail(), coder.getParentEMail());

    		emf.getCache().evict(Coder.class, testCoder.getID());
    		Coder confirm = coderService.getByID(testCoder.getID());
    		assertEquals(update.getFirstName(), confirm.getFirstName());
    		assertEquals(update.getLastName(), confirm.getLastName());
    		assertEquals(update.getParentEMail(), confirm.getParentEMail());
    	}
    	finally
    	{
    		coderService.remove(testCoder);
    	}
    }
    
    @Test(expected=NotInYourClub.class)
    public void testSetCoderNameAndEMailInAnotherClub() 
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
    	
    	Club pierce = clubService.getByID(1);
        controller.setCoderNameAndEMail(1, 
        		new Coder(pierce, "newFirst", "newLast", "", "newEMail@email.net"));
    }
    
    @Test
    public void testSetGroupForCoder() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	
    	Club pierce = clubService.getByID(1); 
    	Coder testCoder = coderService.add(new Coder(pierce, "TEST", "CODER", "", null));
    	Coder coder = null;
    	try
    	{
    		coder = controller.setGroupForCoder(testCoder.getID(), "NEW GROUP");
    		assertEquals("NEW GROUP", coder.getGroup());

    		emf.getCache().evict(Coder.class, testCoder.getID());
    		Coder confirm = coderService.getByID(testCoder.getID());
    		assertEquals("NEW GROUP", confirm.getGroup());
    	}
    	finally
    	{
    		coderService.remove(coder);
    	}
    }

    @Test(expected=NotInYourClub.class)
    public void testSetGroupForCoderInAnotherClub() 
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
    	
        controller.setGroupForCoder(1, "NEW GROUP");
    }
    
    @Test
    public void testRemoveCoder() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	Club pierce = clubService.getByID(1); 
    	Coder testCoder = coderService.add(new Coder(pierce, "TEST", "CODER", "", null));
    	try
    	{
    		controller.removeCoder(testCoder.getID());

    		emf.getCache().evict(Coder.class, testCoder.getID());
    		assertNull(coderService.getByID(testCoder.getID()));
    	}
    	finally
    	{
    		if (coderService.getByID(testCoder.getID()) != null)
    			coderService.remove(testCoder);
    	}
    }

    @Test
    public void testRemoveCoderWithStuff() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	Club pierce = clubService.getByID(1); 
    	Coder testCoder = coderService.add(new Coder(pierce, "TEST", "CODER", "", null));
    	
    	Attendance attendance = attendanceService.add
    			(new Attendance(testCoder, new Date()));
    	
    	CompletedActivity ca1 = completedActivityService.add
    			(new CompletedActivity(testCoder, 
    					activityService.getByID(1), null, "TEST"));
    	CompletedActivity ca2 = completedActivityService.add
    			(new CompletedActivity(testCoder, 
    					activityService.getByID(2), null, "TEST"));
    	CompletedLevel cl = completedLevelService.add(new CompletedLevel
    			(testCoder, levelService.getByID(1), "TEST"));
    	
    	Post post = postService.add(new Post("HI!", testCoder));
    	Work work = workService.updateOrInsertWork
    			(testCoder, "NumberCrunch:Fibonacci", "XXX"); 
    	
    	try
    	{
    		controller.removeCoder(testCoder.getID());

    		emf.getCache().evict(Coder.class, testCoder.getID());
    		assertNull(coderService.getByID(testCoder.getID()));
    	}
    	finally
    	{
    		if (coderService.getByID(testCoder.getID()) != null)
    		{
    			workService.remove(work);
    			postService.remove(post);
    			completedLevelService.remove(cl);
    			completedActivityService.remove(ca1);
    			completedActivityService.remove(ca2);
    			attendanceService.remove(attendance);
    			coderService.remove(testCoder);
    		}
    	}
    }

    @Test(expected=NotInYourClub.class)
    public void testRemoveCoderFromAnotherClub() 
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
        controller.removeCoder(1);
    }

    private CoderCandidate createCoderCandidate(String first, String last,
    		String email, int grade)
    {
    	CoderCandidate candidate = new CoderCandidate();
    	candidate.first = first;
    	candidate.last = last;
    	candidate.email = email;
    	candidate.grade = grade;
    	
    	return candidate;
    }
    
    private void cleanUpCoder(Club club, String first, String last)
    {
		Coder coder = coderService.getByClubAndName(club, first, last);
		if (coder != null)
			coderService.remove(coder);
    }
    
    @Test
    public void testRegisterCoders() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    
    	
    	List<CoderCandidate> candidates = new ArrayList<>();
    	candidates.add(createCoderCandidate("first1", "last1", "email1@email.net", 3));
    	candidates.add(createCoderCandidate("first2", "last2", "email2@email.net", 5));
    	candidates.add(createCoderCandidate("lawrence", "user1", "email3@email.net", 8));
    		// Okay even though another club has a coder with this name
    	
		Club club = clubService.getByID(1);

		Calendar now = Calendar.getInstance();
		int baseYear = now.get(Calendar.YEAR) + 8;
		if (now.get(Calendar.MONTH) > Calendar.JUNE)
			++baseYear;
				
		Calendar graduationDate = Calendar.getInstance();
		graduationDate.set(0, Calendar.JULY, 1, 0, 0, 0);
		graduationDate.set(Calendar.MILLISECOND, 0);

		try
    	{
    		List<CoderCandidate> results = controller.registerCoders(candidates);
    		assertEquals(3, results.size());
    		assertEquals(Status.OK, results.get(0).status);
    		assertEquals(Status.OK, results.get(1).status);
    		assertEquals(Status.OK, results.get(2).status);

    		Coder result1 = coderService.getByClubAndName(club, "first1", "last1"); 
    		assertNotNull(result1);
    		graduationDate.set(Calendar.YEAR, baseYear - 3);
    		assertEquals(graduationDate.getTime(), result1.getGraduation());

    		Coder result2 = coderService.getByClubAndName(club, "first2", "last2"); 
    		assertNotNull(result2);
    		graduationDate.set(Calendar.YEAR, baseYear - 5);
    		assertEquals(graduationDate.getTime(), result2.getGraduation());
    		
    		Coder result3 = coderService.getByClubAndName(club, "lawrence", "user1"); 
    		assertNotNull(result3);
    		graduationDate.set(Calendar.YEAR, baseYear - 8);
    		assertEquals(graduationDate.getTime(), result3.getGraduation());
    	}
    	finally
    	{
    		cleanUpCoder(club, "first1", "last1");
    		cleanUpCoder(club, "first2", "last2");
    		cleanUpCoder(club, "lawrence", "user1");
    	}
    }

    @Test
    public void testRegisterCodersWithNewEMail() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    
    	
    	List<CoderCandidate> candidates = new ArrayList<>();
    	candidates.add(createCoderCandidate("first1", "last1", "email1@email.net", 3));
    	candidates.add(createCoderCandidate("pierce", "user2", "newemail@email.net", 5));
    	
		Club club = clubService.getByID(1);

    	try
    	{
    		List<CoderCandidate> results = controller.registerCoders(candidates);
    		assertEquals(2, results.size());
    		assertEquals(Status.OK, results.get(0).status);
    		assertEquals(Status.NewEMail, results.get(1).status);

    		assertNotNull(coderService.getByClubAndName(club, "first1", "last1"));
    		
    		assertEquals("newemail@email.net", 
    				coderService.getByClubAndName(club, "pierce", "user2").getParentEMail());
    	}
    	finally
    	{
    		cleanUpCoder(club, "first1", "last1");
    		
    		Coder coder2 = coderService.getByClubAndName(club,  "pierce", "user2");
    		if (coder2 != null)
    		{
    			coder2.setParentEMail("parent2@gmail.com");
    			coderService.update(coder2);
    		}
    	}
    }

    @Test
    public void testRegisterCodersWithConflict() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    
    	
    	List<CoderCandidate> candidates = new ArrayList<>();
    	candidates.add(createCoderCandidate("first1", "last1", "email1@email.net", 3));
    	candidates.add(createCoderCandidate("pierce", "user2", "parent2@gmail.com", 5));
    	
		Club club = clubService.getByID(1);

    	try
    	{
    		List<CoderCandidate> results = controller.registerCoders(candidates);
    		assertEquals(2, results.size());
    		assertEquals(Status.OK, results.get(0).status);
    		assertEquals(Status.Conflict, results.get(1).status);

    		assertNotNull(coderService.getByClubAndName(club, "first1", "last1"));
    	}
    	finally
    	{
    		cleanUpCoder(club, "first1", "last1");
    	}
    }

    @Test
    public void testRegisterCodersWithMissingNames() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	
    	List<CoderCandidate> candidates = new ArrayList<>();
    	candidates.add(createCoderCandidate(" ", "last1", "email1@email.net", 3));
    	candidates.add(createCoderCandidate("first2", "", "email2@email.net", 5));
    	
		List<CoderCandidate> results = controller.registerCoders(candidates);
		assertEquals(2, results.size());
		assertEquals(Status.MissingFirstName, results.get(0).status);
		assertEquals(Status.MissingLastName, results.get(1).status);
    }

    @Test
    public void testRegisterCodersWithInvalidEMail() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    
    	
    	List<CoderCandidate> candidates = new ArrayList<>();
    	candidates.add(createCoderCandidate("first1", "last1", "email1@email.net", 3));
    	candidates.add(createCoderCandidate("first2", "last2", "NODOMAIN", 5));
    	
		Club club = clubService.getByID(1);

    	try
    	{
			List<CoderCandidate> results = controller.registerCoders(candidates);
			assertEquals(2, results.size());
			assertEquals(Status.OK, results.get(0).status);
			assertEquals(Status.InvalidEMail, results.get(1).status);
	
			assertNotNull(coderService.getByClubAndName(club, "first1", "last1"));
		}
		finally
		{
			cleanUpCoder(club, "first1", "last1");
		}
    }

    @Test
    public void testRegisterCodersWithInvalidGrades() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	
    	List<CoderCandidate> candidates = new ArrayList<>();
    	candidates.add(createCoderCandidate("first1", "last1", "email1@email.net", 2));
    	candidates.add(createCoderCandidate("first2", "last2", "email2@email.net", 9));
    	
		List<CoderCandidate> results = controller.registerCoders(candidates);
		assertEquals(2, results.size());
		assertEquals(Status.InvalidGrade, results.get(0).status);
		assertEquals(Status.InvalidGrade, results.get(1).status);
    }

    @Test
    public void testAssign() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    
    	CoderGroup group = new CoderGroup();
    	group.name = "NEW GROUP";
    	group.members = new ArrayList<>();
    	
    	CoderCandidate candidate1 = new CoderCandidate();
    	candidate1.first = "pierce";
    	candidate1.last = "user1";
    	group.members.add(candidate1);
    	
    	CoderCandidate candidate2 = new CoderCandidate();
    	candidate2.first = "pierce";
    	candidate2.last = "user2";
    	group.members.add(candidate2);
    	
		Club club = clubService.getByID(1);
    	String oldGroup = coderService.getByClubAndName(club, "pierce", "user1").getGroup();

    	try
    	{
    		CoderGroup results = controller.assignCoders(group);
    		assertEquals(2, results.members.size());
    		assertEquals(Status.OK, results.members.get(0).status);
    		assertEquals(Status.OK, results.members.get(1).status);

    		assertEquals("NEW GROUP", coderService.getByClubAndName(club, "pierce", "user1").getGroup());
    		assertEquals("NEW GROUP", coderService.getByClubAndName(club, "pierce", "user2").getGroup());
    	}
    	finally
    	{
    		Coder coder1 = coderService.getByClubAndName(club, "pierce", "user1");
    		if (coder1 != null) {
    			coder1.setGroup(oldGroup);
    			coderService.update(coder1);
    		}

    		Coder coder2 = coderService.getByClubAndName(club, "pierce", "user2");
    		if (coder2 != null) {
    			coder2.setGroup(oldGroup);
    			coderService.update(coder2);
    		}
    	}
    }

    @Test
    public void testAssignSomeNonExistent() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    
    	CoderGroup group = new CoderGroup();
    	group.name = "NEW GROUP";
    	group.members = new ArrayList<>();
    	
    	CoderCandidate candidate1 = new CoderCandidate();
    	candidate1.first = "pierce";
    	candidate1.last = "user1";
    	group.members.add(candidate1);
    	
    	CoderCandidate candidate2 = new CoderCandidate();
    	candidate2.first = "pierce";
    	candidate2.last = "user22";
    	group.members.add(candidate2);
    	
    	// Won't find this user since it only exists in a different club
    	CoderCandidate candidate3 = new CoderCandidate();
    	candidate3.first = "lawrence";
    	candidate3.last = "user1";
    	group.members.add(candidate3);
    	
		Club club = clubService.getByID(1);
    	String oldGroup = coderService.getByClubAndName(club, "pierce", "user1").getGroup();

    	try
    	{
    		CoderGroup results = controller.assignCoders(group);
    		assertEquals(3, results.members.size());
    		assertEquals(Status.OK, results.members.get(0).status);
    		assertEquals(Status.NotFound, results.members.get(1).status);
    		assertEquals(Status.NotFound, results.members.get(2).status);

    		assertEquals("NEW GROUP", coderService.getByClubAndName(club, "pierce", "user1").getGroup());
    	}
    	finally
    	{
    		Coder coder1 = coderService.getByClubAndName(club, "pierce", "user1");
    		if (coder1 != null) {
    			coder1.setGroup(oldGroup);
    			coderService.update(coder1);
    		}
    	}
    }

    @Test
    public void testClearGroups ()
        throws Exception
    {
    	AuthnTest.username = USERNAME_DOOM_COACH;
    	controller.clearGroups();
        CoderServiceTest.assertGroupsClearedAndRestore(emf);
    }
    
    @Test
    public void testGetStaff() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
        List<Staff> staff = controller.getStaff();
        assertEquals(4, staff.size());
        Staff staffer = staff.get (0);
        assertEquals ("Intille", staffer.getLastName());
    }
    
    @Test
    public void testSetAdminForCoach() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	Club pierce = clubService.getByID(1); 
    	Staff coachInDB = staffService.add(new Staff(pierce, "TEST", "COACH", ""));
		assertFalse(coachInDB.isAdmin());
    	try
    	{
    		coachInDB.setAdmin(true);
    		Staff coachFromWS = controller.setStaff(coachInDB.getID(), coachInDB);
    		assertTrue(coachFromWS.isAdmin());

    		emf.getCache().evict(Staff.class, coachInDB.getID());
    		Staff confirm = staffService.getByID(coachInDB.getID());
    		assertTrue(confirm.isAdmin());
    	}
    	finally
    	{
    		staffService.remove(coachInDB);
    	}
    }

    @Test
    public void testResetAdminForCoach() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	Club pierce = clubService.getByID(1); 
    	Staff coachInDB = staffService.add(new Staff(pierce, "TEST", "COACH", ""));
    	coachInDB.setAdmin(true);
    	staffService.update(coachInDB);
		assertTrue(coachInDB.isAdmin());
    	try
    	{
    		coachInDB.setAdmin(false);
    		Staff coachFromWS = controller.setStaff(coachInDB.getID(), coachInDB);
    		assertFalse(coachFromWS.isAdmin());

    		emf.getCache().evict(Staff.class, coachInDB.getID());
    		Staff confirm = staffService.getByID(coachInDB.getID());
    		assertFalse(confirm.isAdmin());
    	}
    	finally
    	{
    		staffService.remove(coachInDB);
    	}
    }

    @Test(expected=NotInYourClub.class)
    public void testSetAdminForCoachInAnotherClub() 
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
    	Staff coach = staffService.getByID(ID_PIERCE_COACH);
    	coach.setAdmin(false);
        controller.setStaff(ID_PIERCE_COACH, coach);
    }
    
    @Test(expected=AdminSelfDestruction.class)
    public void testResetAdminForSelf() 
    {
    	Staff admin = staffService.getByID(ID_PIERCE_COACH); 
		assertTrue(admin.isAdmin());
    	AuthnTest.username = "" + admin.getClub().getID() + "_" + 
    			admin.getFirstName() + "_" + admin.getLastName();
    	try
    	{
    		admin.setAdmin(false);
    		controller.setStaff(admin.getID(), admin);
    	}
    	finally
    	{
    		emf.getCache().evict(Staff.class, admin.getID());
    		Staff confirm = staffService.getByID(admin.getID());
    		assertTrue(confirm.isAdmin());
    	}
    }

    @Test
    public void testRemoveCoach() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    	Club pierce = clubService.getByID(1); 
    	Staff testCoach = staffService.add(new Staff(pierce, "TEST", "COACH", ""));
    	try
    	{
    		controller.removeStaff(testCoach.getID());

    		emf.getCache().evict(Staff.class, testCoach.getID());
    		assertNull(staffService.getByID(testCoach.getID()));
    	}
    	finally
    	{
    		if (staffService.getByID(testCoach.getID()) != null)
    			staffService.remove(testCoach);
    	}
    }

    @Test(expected=NotInYourClub.class)
    public void testRemoveCoachFromAnotherClub() 
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
        controller.removeStaff(ID_PIERCE_COACH);
    }

    @Test(expected=AdminSelfDestruction.class)
    public void testRemoveSelf() 
    {
    	Staff admin = staffService.getByID(ID_PIERCE_COACH); 
		assertTrue(admin.isAdmin());
		
		AuthnTest.username = USERNAME_PIERCE_COACH;
        controller.removeStaff(ID_PIERCE_COACH);
    }

    private StaffCandidate createStaffCandidate(String first, 
    		String last, String email)
    {
    	StaffCandidate candidate = new StaffCandidate();
    	candidate.first = first;
    	candidate.last = last;
    	candidate.email = email;
    	
    	return candidate;
    }
    
    private void cleanUpStaff(Club club, String first, String last)
    {
    	Staff staff = staffService.getByClubAndName(club, first, last);
		if (staff != null)
			staffService.remove(staff);
    }
    
    @Test
    public void testRegisterCoaches() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    
    	
    	List<StaffCandidate> candidates = new ArrayList<>();
    	candidates.add(createStaffCandidate("first1", "last1", "email1@email.net"));
    	candidates.add(createStaffCandidate("first2", "last2", "email2@email.net"));
    	candidates.add(createStaffCandidate("Phil", "Durbin", "email3@email.net"));
    		// Okay even though another club has a coach with this name
    	
		Club club = clubService.getByID(1);

    	try
    	{
    		List<StaffCandidate> results = controller.registerCoaches(candidates);
    		assertEquals(3, results.size());
    		assertEquals(Status.OK, results.get(0).status);
    		assertEquals(Status.OK, results.get(1).status);
    		assertEquals(Status.OK, results.get(2).status);

    		assertNotNull(staffService.getByClubAndName(club, "first1", "last1"));
    		assertNotNull(staffService.getByClubAndName(club, "first2", "last2"));
    		assertNotNull(staffService.getByClubAndName(club, "Phil", "Durbin"));
    	}
    	finally
    	{
    		cleanUpStaff(club, "first1", "last1");
    		cleanUpStaff(club, "first2", "last2");
    		cleanUpStaff(club, "Phil", "Durbin");
    	}
    }

    @Test
    public void testRegisterCoachesWithConflict() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    
    	
    	List<StaffCandidate> candidates = new ArrayList<>();
    	candidates.add(createStaffCandidate("first1", "last1", "email1@email.net"));
    	candidates.add(createStaffCandidate("Andrew", "Kuklewicz", "email2@email.net"));

		Club club = clubService.getByID(1);

    	try
    	{
    		List<StaffCandidate> results = controller.registerCoaches(candidates);
    		assertEquals(2, results.size());
    		assertEquals(Status.OK, results.get(0).status);
    		assertEquals(Status.Conflict, results.get(1).status);

    		assertNotNull(staffService.getByClubAndName(club, "first1", "last1"));
    	}
    	finally
    	{
    		cleanUpStaff(club, "first1", "last1");
    	}
    }

    @Test
    public void testRegisterCoachesWithInvalidEMail() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
    
    	
    	List<StaffCandidate> candidates = new ArrayList<>();
    	candidates.add(createStaffCandidate("first1", "last1", "email1@email.net"));
    	candidates.add(createStaffCandidate("first2", "last2", "NODOMAIN"));
    	
		Club club = clubService.getByID(1);

    	try
    	{
    		List<StaffCandidate> results = controller.registerCoaches(candidates);
    		assertEquals(2, results.size());
    		assertEquals(Status.OK, results.get(0).status);
    		assertEquals(Status.InvalidEMail, results.get(1).status);

    		assertNotNull(staffService.getByClubAndName(club, "first1", "last1"));
    	}
    	finally
    	{
    		cleanUpStaff(club, "first1", "last1");
    	}
    }
}
