package codersclub.web;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import codersclub.Activity;
import codersclub.Authn;
import codersclub.Coder;
import codersclub.CompletedActivity;
import codersclub.Service;
import codersclub.db.JPAService;

@Controller
@RequestMapping("/Coder.do")
public class CoderController
{
	@Autowired
	private Authn authn;
	
    @Autowired
    private JPAService<Coder> coderService;
    
    @Autowired
    private JPAService<CompletedActivity> completedActivityService;
    
    @Autowired
    private Service service; 
    
    @RequestMapping(method=RequestMethod.GET)
    public ModelAndView getHistory()
    {
        Coder coder = (Coder) authn.getLoggedInUser();
        Map<Integer,Activity> activities = new HashMap<> ();
        Map<Integer,List<Integer>> steps = new HashMap<> ();
        Map<Integer,Date> completed = new HashMap<> ();
        Map<Integer,Integer> points = new HashMap<> ();
        for (CompletedActivity completedActivity : 
            completedActivityService.getAllByFilter 
                ("coder.ID", coder.getID ()))
        {
            int activityID = completedActivity.getActivity ().getID ();
            Date dateCompleted = completedActivity.getDateCompleted ();
            
            activities.put (activityID, completedActivity.getActivity ());
            
            if (!steps.containsKey (activityID))
                steps.put (activityID, new ArrayList<>());
            steps.get(activityID).add(completedActivity.getStep());
            
            if (!completed.containsKey (activityID) ||
                    completed.get (activityID).after (dateCompleted))
                completed.put (activityID, dateCompleted);

            int levelNumber = completedActivity.getActivity ()
                .getLevel ().getNumber ();
            int pointsSoFar = points.containsKey(levelNumber) 
                ? points.get (levelNumber) : 0;
            points.put (levelNumber, 
                pointsSoFar + completedActivity.getActivity ().getPoints ());
        }

        ModelAndView mav = new ModelAndView ("coder.jsp", "completed", completed);
        
        mav.getModel().put("points", points);
        
        if (service.getHighestCompletedLevel(coder.getID ()).getNumber () > 1
            && !coder.hasSeenNotebookMessage ())
        {
            coder.setSeenNotebookMessage (1);
            coderService.update (coder);
            
            mav.getModel ().put ("showNotebookAndForum", true);
        }

        return mav;
    }
}
 