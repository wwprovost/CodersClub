package codersclub.web;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import codersclub.Authn;
import codersclub.Coder;
import codersclub.db.JPAService;

@Controller
@RequestMapping("/Notebook.do")
public class NotebookController
{
	@Autowired
	private Authn authn;
	
    @Autowired
    private JPAService<Coder> coderService;
   
    @RequestMapping(method=RequestMethod.GET)
    public String setUp ()
    {
        return "notebook.jsp";
    } 

    @RequestMapping(method=RequestMethod.POST)
    public String save (@RequestParam("notes") String notes, 
        HttpServletRequest request)
    {
        Coder coder = (Coder) authn.getLoggedInUser();
        coder.setNotes (notes);
        coderService.update (coder);
        
        return "notebook.jsp";
    }
}

 