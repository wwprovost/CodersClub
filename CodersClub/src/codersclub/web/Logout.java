package codersclub.web;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/Logout.do")
public class Logout
{
	@RequestMapping(method=RequestMethod.POST)
	public String logout (HttpServletRequest request)
    {
    	request.getSession().invalidate();
    	return "redirect:/EntryPoint.do";
    }
}
