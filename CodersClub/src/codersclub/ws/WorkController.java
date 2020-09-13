package codersclub.ws;

import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import codersclub.Authn;
import codersclub.Coder;
import codersclub.Staff;
import codersclub.TeamMember;
import codersclub.TeamService;
import codersclub.User;
import codersclub.WorkService;
import codersclub.ex.AuthorizationFailure;

@Controller
@RequestMapping("/Work")
public class WorkController extends AuthenticatedController
{
	public static List<String> WHITELIST = 
			Collections.singletonList("Playground:index");
	
	private static final Logger LOG = 
			Logger.getLogger(WorkController.class.getName());
	
	@Autowired
	private Authn authn;
	
    @Autowired
    private WorkService service; 
    
    @Autowired
    private TeamService teamService;
    
    @RequestMapping(value="{pageID}", method=RequestMethod.GET)
    @ResponseBody
    public String getWork (@PathVariable("pageID") String pageID,
    	@RequestParam(name="shadow" ,required=false) Integer shadow,
    	@RequestParam(name="teamCode" ,required=false) String teamCode,
    	@RequestParam(name="teammate" ,required=false) Integer teammate)
    {
        Coder toRetrieve = null;
        if (shadow != null)
        {
        	if (authn.getLoggedInUser() instanceof Staff)
        		toRetrieve = getCoderInOurClub(shadow);
        	else
        		throw new AuthorizationFailure("staff member");
        }
        else if (teamCode != null)
        {
        	Coder loggedIn = (Coder) authn.getLoggedInUser();
        	List<TeamMember> team = teamService.getTeam(pageID, loggedIn);
        	if (team.size() == 0 || !team.get(0).getTeamCode().equals(teamCode))
        	{
        		throw new TeamController.NoSuchTeam(teamCode);
        	}
        	if (team.stream()
        			.filter(member -> member.getCoder().getID() == teammate)
        			.findAny().isPresent())
			{
				toRetrieve = coderService.getByID(teammate);
			}
			else
			{
				throw new TeamController.NoSuchTeam(teamCode);
			}
        }
        else
        {
        	toRetrieve = (Coder) authn.getLoggedInUser();
        }
        
        String code = service.getWork (toRetrieve, pageID); 
        LOG.fine("GET: " + code);
        return code;
    }
    
    @RequestMapping(value="{pageID}", method=RequestMethod.PUT)
    public ResponseEntity<Void> putWork (@PathVariable("pageID") String pageID,
    		@RequestBody String code)
    {
    	LOG.fine("PUT: " + code); 
        Coder coder = (Coder) authn.getLoggedInUser();
        
        return new ResponseEntity<> 
            (service.updateOrInsertWork (coder, pageID, code) != null
                ? HttpStatus.CREATED : HttpStatus.NO_CONTENT); 
   }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public class NotAGroupActivity
        extends RuntimeException 
    {
        public NotAGroupActivity()
        {
            super("This page is not a group activity.");
        }
    }
    /**
     * Returns a list of all unique programs for this page ID,
     * <strong>except</strong> that of any logged-in coder.
     * For security reasons, this only works for pageIDs on a hard-coded
     * {@link #WHITELIST whitelist}.
     */
    @RequestMapping(value="{pageID}/All", method=RequestMethod.GET)
    @ResponseBody
    public List<String> getAllWork (@PathVariable("pageID") String pageID,
        	@RequestParam(name="shadow" ,required=false) Integer shadow)
    {
    	if (!WHITELIST.contains(pageID)) {
    		throw new NotAGroupActivity();
    	}
    	
    	User user = authn.getLoggedInUser();
        Coder toExclude = user instanceof Coder 
        		? (Coder) user 
        		: (shadow != null ? getCoderInOurClub(shadow) : null);
        
        List<String> code = service.getAllWork (toExclude, pageID); 
        LOG.fine("GET: " + code);
        return code;
    }
}
 