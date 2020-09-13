package codersclub.web;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import codersclub.Authn;
import codersclub.Coder;
import codersclub.CoderService;
import codersclub.CompletedActivity;
import codersclub.Service;
import codersclub.User;
import codersclub.db.JPAService;

@Controller
@RequestMapping("Coach")
public class CoachController
{
	@Autowired
	private Authn authn;
	
    @Autowired
    private Service service;
    
    @Autowired
    private CoderService coderService;
    
    @Autowired
    private JPAService<CompletedActivity> completedActivityService;
    
    private Map<String,Object> getCoderAndCompleted(Coder coder)
    {
        Map<String,Object> result = new HashMap<String,Object> ();
        result.put ("coder", coder);
        
        Map<Integer,Boolean> completed = new HashMap<> ();
        for (CompletedActivity completedActivity : 
            completedActivityService.getAllByFilter ("coder.ID", coder.getID ()))
        {
            int activityID = completedActivity.getActivity ().getID ();
            completed.put (activityID, true);
        }
        result.put ("completed", completed);
        
        return result;
    }
    
    @RequestMapping(value="Coach.do")
    public String homePage()
    {
        return "coach.jsp";
    }

    @RequestMapping(value="Checklist.do", params="coder")
    public ModelAndView getChecklistForCoder 
        (@RequestParam("coder") int coderID)
    {
        return new ModelAndView ("checklist.jsp", "coders", 
            Collections.singletonList(getCoderAndCompleted
                (coderService.getByID(coderID))));
    }

    @RequestMapping(value="Checklist.do", params="group")
    public ModelAndView getChecklistsForGroup 
        (@RequestParam("group") String group)
    {
        User coach = authn.getLoggedInUser();
        List<Map<String,Object>> results = new ArrayList<> ();
        for (Coder coder : coderService.getGroupOfCoders (coach.getClub(), group))
            results.add (getCoderAndCompleted (coder));
        
        return new ModelAndView ("checklist.jsp", "coders", results);
    }

    private Map<String,Object> getCoderAndHistory(Coder coder)
    {
        Map<String,Object> result = new HashMap<String,Object> ();
        result.put ("coder", coder);
        result.put ("history", service.getHistory (coder));
        
        return result;
    }
}
