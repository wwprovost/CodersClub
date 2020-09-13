package codersclub.web;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;

import codersclub.AttendanceService;
import codersclub.Authn;
import codersclub.Staff;
import codersclub.Coder;
import codersclub.User;

@Controller
@RequestMapping("/EntryPoint.do")
@SessionAttributes({"user"})
@ControllerAdvice
public class EntryPoint
{
    @Autowired
    private AttendanceService attendanceService;
    
    @Autowired
    private Authn authn;
    
    @ModelAttribute("user")
    public User getUser (HttpServletRequest request)
    {
    	return authn.getLoggedInUser();
    }
    
    @RequestMapping(method=RequestMethod.GET)
    public String seeWhoLoggedIn (HttpServletRequest request)
    {
        User user = getUser (request);
        if (user instanceof Coder)
        {
        	attendanceService.recordAttendance((Coder) user);
            return "Coder.do";
        }
        else if (user instanceof Staff)
        {
        	Staff staff = (Staff) user;
        	if (staff.isAdmin() && !staff.isCoach())
        		return "redirect:Staff/coders.html";
        	else
        		return "redirect:Coach/Coach.do";
        }
        else
            return "error.jsp";
    }
}
