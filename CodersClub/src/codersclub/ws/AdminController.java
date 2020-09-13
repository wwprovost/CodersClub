package codersclub.ws;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Calendar;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import codersclub.Club;
import codersclub.Coder;
import codersclub.Staff;
import codersclub.User;
import codersclub.ex.AdminSelfDestruction;
import codersclub.ex.AuthorizationFailure;
import codersclub.ex.NotInYourClub;
import codersclub.ex.WrongID;

@RestController
@RequestMapping("/Admin")
public class AdminController extends AuthenticatedController
{
	private static final Logger LOG = 
			Logger.getLogger(AdminController.class.getName());
	
    public enum Status { OK, Conflict, MissingFirstName, MissingLastName,
    	NotFound, NewEMail, InvalidEMail, InvalidGrade, Error };
    
    public static class Candidate
    {
        public String first;
        public String last;
        public String email;
        public Status status = Status.OK;
    }
    
    public static final int MIN_GRADE = 3;
    public static final int MAX_GRADE = 8;
    public static class CoderCandidate extends Candidate
    {
        public int grade;
    }
    
    public static class CoderGroup
    {
        public String name;
        public List<CoderCandidate> members;
    }
    
    public static class StaffCandidate extends Candidate
    {
        public String password;
    }
    
	private Staff getStaffInOurClub(int ID)
    {
    	Club club = authn.getLoggedInUser().getClub();
    	Staff coach = staffService.getByID(ID);
    	if (coach.getClub().getID() != club.getID())
    		throw new NotInYourClub();
    	
    	return coach;
    }
    
    @RequestMapping(value="Coders/{ID}", method=RequestMethod.PATCH)
    public Coder setCoderNameAndEMail (@PathVariable("ID") int ID, @RequestBody Coder update)
    {
    	Coder existing = getCoderInOurClub(ID);
    	existing.setFirstName(update.getFirstName());
    	existing.setLastName(update.getLastName());
    	existing.setParentEMail(update.getParentEMail());
    	return coderService.update(existing);
    }
    
    @RequestMapping(value="Coders/{ID}/Group", method=RequestMethod.PATCH)
    public Coder setGroupForCoder (@PathVariable("ID") int ID, @RequestBody String group)
    {
    	Coder coder = getCoderInOurClub(ID);
    	coder.setGroup(group.equals("null") ? null : group);
    	return coderService.update(coder);
    }
    
    @RequestMapping(value="Coders/{ID}", method=RequestMethod.DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeCoder (@PathVariable("ID") int ID)
    {
    	getCoderInOurClub(ID);
    	coderService.removeByID(ID);
    }
    
    @RequestMapping(value="Coders", method=RequestMethod.POST)
    @ResponseStatus(HttpStatus.CREATED)
    public List<CoderCandidate> registerCoders 
    	(@RequestBody List<CoderCandidate> candidates)
    {
        User admin = authn.getLoggedInUser();
        for (CoderCandidate candidate : candidates)
            if (coderService.exists(admin.getClub(), candidate.first, candidate.last))
            {
            	Coder coder = coderService.getByClubAndName
            			(admin.getClub(), candidate.first, candidate.last);
            	if (coder.getParentEMail().equals(candidate.email)) 
            	{
            		candidate.status = Status.Conflict;
            	} 
            	else 
            	{ 
            		try 
            		{
            			coder.setParentEMail(candidate.email);
            			coderService.update(coder);
            			candidate.status = Status.NewEMail;
                    }
                    catch (IllegalArgumentException ex)
                    {
                    	LOG.info("Invalid e-mail address: " + candidate.email);
                        candidate.status = Status.InvalidEMail;
                    }
                    catch (Exception ex)
                    {
                    	LOG.log(Level.WARNING, "Couldn't process candidate record.", ex);
                        candidate.status = Status.Error;
                    }
            	}
            }
            else
            {
            	if (candidate.first == null || candidate.first.trim().isEmpty()) 
            		candidate.status = Status.MissingFirstName;
            	else if (candidate.last == null || candidate.last.trim().isEmpty())
            		candidate.status = Status.MissingLastName;
            	if (candidate.grade < MIN_GRADE || candidate.grade > MAX_GRADE)
            		candidate.status = Status.InvalidGrade;
            	else
	                try
	                {
	                    Coder newCoder = new Coder(admin.getClub (), 
	                        candidate.first, candidate.last, "", candidate.email);
	                    
	                    Calendar graduationDate = Calendar.getInstance();
	                    int year = graduationDate.get(Calendar.YEAR) + 8 - candidate.grade;
	                    if (graduationDate.get(Calendar.MONTH) > Calendar.JUNE)
	                    	++year;
	                    
	                    graduationDate.set(year,  Calendar.JULY, 1, 0, 0, 0);
	                    graduationDate.set(Calendar.MILLISECOND, 0);
	                    newCoder.setGraduation(graduationDate.getTime());
	                    
	                    coderService.add(newCoder);
	                }
	                catch (IllegalArgumentException ex)
	                {
	                    candidate.status = Status.InvalidEMail;
	                }
	                catch (Exception ex)
	                {
	                	LOG.log(Level.WARNING, "Couldn't process candidate record.", ex);
	                    candidate.status = Status.Error;
	                }
            }
        
        return candidates;
    }
    
    @RequestMapping(value="GroupNames", method=RequestMethod.GET)
    public List<String> getGroupNames ()
    {
    	return coderService.getGroups(authn.getLoggedInUser().getClub());
    }

    @RequestMapping(value="Groups", method=RequestMethod.PATCH)
    public CoderGroup assignCoders (@RequestBody CoderGroup group)
    {
        User admin = authn.getLoggedInUser();
        for (CoderCandidate candidate : group.members)
        {
            Coder coder = coderService.getByClubAndName
                (admin.getClub (), candidate.first, candidate.last);
            if (coder == null)
            {
                candidate.status = Status.NotFound;
            }
            else
            {
                try
                {
                    coder.setGroup (group.name);
                    coderService.update (coder);
                }
                catch (Exception ex)
                {
                	LOG.log(Level.WARNING, "Couldn't process candidate record.", ex);
                    candidate.status = Status.Error;
                }
            }
        }
        
        return group;
    }

    @RequestMapping(value="Groups", method=RequestMethod.DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearGroups ()
    {
        User admin = authn.getLoggedInUser();
        coderService.clearGroups(admin.getClub());
    }

    @RequestMapping(value="Staff", method=RequestMethod.GET)
    public List<Staff> getStaff ()
    {
    	return staffService.getAllByClub(authn.getLoggedInUser().getClub());
    }
    
    @RequestMapping(value="Staff", method=RequestMethod.GET, params="coach")
    public List<Staff> getCoaches ()
    {
    	return staffService.getAllCoaches(authn.getLoggedInUser().getClub());
    }
    
    @RequestMapping(value="Staff", method=RequestMethod.GET, params="admin")
    public List<Staff> getAdmins ()
    {
    	return staffService.getAllAdmins(authn.getLoggedInUser().getClub());
    }
    
    @RequestMapping(value="Staff/{ID}", method=RequestMethod.PUT)
    public Staff setStaff(@PathVariable("ID") int ID, @RequestBody Staff staff)
    {
    	if (ID != staff.getID())
    		throw new WrongID();
    	
    	Staff user = (Staff) authn.getLoggedInUser();
    	Staff current = getStaffInOurClub(ID);
    	
    	// Can't remove your own admin or senior admin privileges
    	if (current.isAdmin() && !staff.isAdmin() && user.getID() == ID)
    		throw new AdminSelfDestruction();
    	if (current.isSenior() && !staff.isSenior() && user.getID() == ID)
    		throw new AdminSelfDestruction();
    	
    	// Only a senior admin can grant or deny senior admin privilege
    	if (!user.isSenior() && current.isSenior() != staff.isSenior())
    		throw new AuthorizationFailure("senior admin");
    	
    	// Force validation of e-mail address
    	staff.setEMail(staff.getEMail());
    	
    	return staffService.update(staff);
    }
    
    @RequestMapping(value="Staff/{ID}", method=RequestMethod.DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeStaff (@PathVariable("ID") int ID)
    {
    	getStaffInOurClub(ID);
    	if (((Staff) authn.getLoggedInUser()).getID() == ID)
    		throw new AdminSelfDestruction();
    	
    	staffService.removeByID(ID);
    }
    
    @RequestMapping(value="Staff", method=RequestMethod.POST, params="coach")
    @ResponseStatus(HttpStatus.CREATED)
    public List<StaffCandidate> registerCoaches (@RequestBody List<StaffCandidate> candidates)
    {
    	final SecureRandom generator = new SecureRandom();
    	
        User admin = authn.getLoggedInUser();
        for (StaffCandidate candidate : candidates)
            if (staffService.exists(admin.getClub(), candidate.first, candidate.last))
            {
                candidate.status = Status.Conflict;
            }
            else
            {
                try
                {
                	byte[] buffer = new byte[6];
                	generator.nextBytes(buffer);
                	String password = Base64.getEncoder().encodeToString(buffer)
                			.toUpperCase().replace("/", "0").replace("+", "0");
                	
                    Staff newCoach = new Staff(admin.getClub (), 
                        candidate.first, candidate.last, password);
                    newCoach.setEMail(candidate.email);
                    newCoach.setCoach(true);
                    staffService.add(newCoach);
                    candidate.password = password;
                }
                catch (IllegalArgumentException ex)
                {
                	LOG.info("Invalid e-mail address: " + candidate.email);
                	candidate.status = Status.InvalidEMail;
                }
                catch (Exception ex)
                {
                	LOG.log(Level.WARNING, "Couldn't process candidate record.", ex);
                    candidate.status = Status.Error;
                }
            }
        
        return candidates;
    }
}
