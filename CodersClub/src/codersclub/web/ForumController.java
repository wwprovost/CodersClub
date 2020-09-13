package codersclub.web;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import codersclub.Authn;
import codersclub.Coder;
import codersclub.Post;
import codersclub.db.JPAService;

@Controller
public class ForumController
{
	@Autowired
	private Authn authn;
	
    @Autowired
    private JPAService<Post> postService;
    
    @RequestMapping(value="/Forum.do",  method=RequestMethod.GET)
    public String setUp ()
    {
        return "forum.jsp";
    } 
    
    @RequestMapping(value="/Posts.do", method=RequestMethod.GET)
    @ResponseBody
    public List<Post> getAllPosts ()
    {
        return postService.getAll(); 
    }
    
    @RequestMapping(value="/Posts.do", method=RequestMethod.POST)
    @ResponseBody
    @ResponseStatus(HttpStatus.CREATED)
    public Post submit (@RequestBody String text, HttpServletRequest request)
    {
        Coder coder = (Coder) authn.getLoggedInUser();
        Post post = new Post (text, coder);
        postService.add (post);

        return post;
    }
   
    @RequestMapping(value="/Posts.do", method=RequestMethod.PUT)
    @ResponseBody
    public String update (@RequestParam("ID") int ID, @RequestBody String text)
    { 
        Post post = postService.getByID (ID);
        post.setWhat (text);
        
        Date now = new Date();
        post.setWhen (now);
        post.setWhen2 (now);
        
        postService.update (post);
        
        return post.getDateAndTime();
    }

    
    @RequestMapping(value="/Posts.do", method=RequestMethod.DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete (@RequestParam("ID") int ID)
    {
        postService.removeByID (ID);
    }
} 

 