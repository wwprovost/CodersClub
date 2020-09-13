package codersclub.web;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalLong;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import codersclub.Activity;
import codersclub.Attendance;
import codersclub.AttendanceService;
import codersclub.Authn;
import codersclub.Club;
import codersclub.Staff;
import codersclub.Coder;
import codersclub.CompletedActivity;
import codersclub.CompletedLevel;
import codersclub.Level;
import codersclub.Service;
import codersclub.User;
import codersclub.db.JPAService;
import codersclub.ex.NotInYourClub;

@Controller
@RequestMapping("Coach/History.do")
public class HistoryController
{
	private static final Logger LOG =
			Logger.getLogger(HistoryController.class.getName());
	
	@Autowired
	private Authn authn;
	
    @Autowired
    private JPAService<Coder> coderService;

    @Autowired
    private JPAService<Level> levelService;

    @Autowired
    private JPAService<Activity> activityService;

    @Autowired
    private JPAService<CompletedLevel> completedLevelService;
    
    @Autowired
    private JPAService<CompletedActivity> completedActivityService;
    
    @Autowired
    private AttendanceService attendanceService;
    
    @Autowired
    private Service service; 
    
    private Coder getCoderInOurClub(int ID)
    {
    	Club club = authn.getLoggedInUser().getClub();
    	Coder coder = coderService.getByID(ID);
    	if (coder.getClub().getID() != club.getID())
    		throw new NotInYourClub();
    	
    	return coder;
    }
    
    private Staff getCertifyingCoach ()
    {
        User user = authn.getLoggedInUser();
        if (user instanceof Staff) 
        {
        	if (((Staff) user).isCoach())
        		return (Staff) user;

            LOG.warning("HMM ... admin trying to be a coach? " + 
            		user.getFirstName() + " " + user.getLastName());
            return null;
        }
        
        LOG.warning("HMM ... coder trying to be a coach? " + 
        		user.getFirstName() + " " + user.getLastName());
        return null;
    }
    
    @RequestMapping(method=RequestMethod.GET)
    public ModelAndView getHistory (@RequestParam("coder") int ID)
    {
        Coder coder = getCoderInOurClub (ID);
        Map<Integer,Date> completed = new HashMap<> ();
        Map<Integer,Integer> points = new HashMap<> ();

        for (CompletedActivity completedActivity : 
            completedActivityService.getAllByFilter ("coder.ID", coder.getID ()))
        {
            int activityID = completedActivity.getActivity ().getID ();
            completed.put (activityID, completedActivity.getDateCompleted ());

            int levelNumber = completedActivity.getActivity ()
                .getLevel ().getNumber ();
            int pointsSoFar = points.containsKey(levelNumber) 
                ? points.get (levelNumber) : 0;
            points.put (levelNumber, 
                pointsSoFar + completedActivity.getActivity ().getPoints ());
        }
        
        ModelAndView mav = new ModelAndView ("history.jsp");
        mav.addObject ("completed", completed);
        mav.addObject ("points", points);
        mav.addObject ("coder", coder);
        
        return mav;
    }
 
    @RequestMapping(method=RequestMethod.POST, params="command=toggleCompletedLevel")
    @ResponseBody
    public String toggleCompletedLevel
        (@RequestParam("coder") int coderID, 
         @RequestParam("level") int levelNumber)
    {
    	Coder coder = getCoderInOurClub(coderID);
    	
        CompletedLevel completedLevel = 
            service.getCompletedLevel (coderID, levelNumber); 
        if (completedLevel != null)
        {
            completedLevelService.remove (completedLevel);
            return "Completed";
        }
        else
        {
            completedLevelService.add (new CompletedLevel 
                (coder, levelService.getByID (levelNumber),
                    getCertifyingCoach().getName ()));
            return new SimpleDateFormat("M/d/yy").format(new Date());
        }
    }

    @RequestMapping(method=RequestMethod.POST, params="command=toggleEnabledLevel")
    @ResponseBody
    public void toggleEnabledLevel
        (@RequestParam("coder") int coderID, 
         @RequestParam("level") int levelNumber)
    {
        Coder coder = getCoderInOurClub (coderID);
        coder.setEnabledLevel 
            (levelNumber > coder.getEnabledLevel ()
                ? levelNumber
                : levelNumber - 1);
        coderService.update (coder);
    } 
 
    @RequestMapping(method=RequestMethod.POST, params="command=toggleCompletedActivity")
    @ResponseBody
    public String toggleCompletedActivity
        (@RequestParam("coder") int coderID, 
         @RequestParam("activity") int activityID)
    { 
    	Coder coder = getCoderInOurClub(coderID);
        CompletedActivity completedActivity =
            service.getCompletedActivity (coderID, activityID);
        if (completedActivity == null)
        {
        	List<Attendance> attendance = 
        			attendanceService.getAllByFilter("coder.ID", coderID);
        	OptionalLong latest = attendance.stream()
        			.mapToLong(a -> a.getAttended().getTime()).max();
        	Date certDate = latest.isPresent() 
        			? new Date(latest.getAsLong())
        			: new Date();
        	
        	completedActivity = new CompletedActivity(coder, 
        			activityService.getByID (activityID), 0,
                    getCertifyingCoach().getName (), certDate);
            completedActivityService.add (completedActivity);
            return new SimpleDateFormat("M/d/yy").format(certDate);
        }
        else
        {
            completedActivityService.remove (completedActivity);
            return "";
        }
    }
}
 