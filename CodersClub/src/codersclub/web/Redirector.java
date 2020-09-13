package codersclub.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping({"SignUp", "Signup", "signUp", "signup"})
public class Redirector
{
    @RequestMapping(method=RequestMethod.GET)
    public String redirectToSignupSite()
    {
    	//TODO Get this into the database as a club-specific setting, load from there
    	// Or, start taking signups directly in the application ...
        return "redirect:https://forms.gle/2TkhUUAQyZsd2dND8";
    }
}
