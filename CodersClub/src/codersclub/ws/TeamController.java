package codersclub.ws;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import codersclub.Coder;
import codersclub.Staff;
import codersclub.TeamMember;
import codersclub.TeamService;
import codersclub.ex.AuthorizationFailure;

@RestController
@RequestMapping("/Team")
public class TeamController extends AuthenticatedController
{
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public static class NoSuchTeam
	    extends RuntimeException 
	{
	    public NoSuchTeam(String teamCode)
	    {
	        super("No team with code: " + teamCode);
	    }
	}
	
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public static class AlreadyAMember
	    extends RuntimeException 
	{
	    public AlreadyAMember(String teamCode)
	    {
	        super("You are already a member of team: " + teamCode);
	    }
	}
		
    @Autowired
    private TeamService service; 
    
    @RequestMapping(method=RequestMethod.POST)
    @ResponseStatus(HttpStatus.CREATED)
    public String createTeam(@RequestParam(name="pageID") String pageID)
    {
    	if (authn.getLoggedInUser() instanceof Coder)
    	{
	    	Coder coder = (Coder) authn.getLoggedInUser();
	    	List<TeamMember> existingTeam = service.getTeam(pageID, coder);
	    	if (existingTeam.size() != 0)
	    	{
	    		throw new AlreadyAMember(existingTeam.get(0).getTeamCode());
	    	}
	    	
	    	return service.createTeam(pageID, coder).getTeamCode();
    	}
    	else
    		throw new AuthorizationFailure("coder"); 
    }
    
    @RequestMapping(value="{teamCode}", method=RequestMethod.PUT)
    public int joinTeam(@PathVariable("teamCode") String teamCode)
    {
    	if (authn.getLoggedInUser() instanceof Coder)
    	{
    		try
	    	{
	    		return service.joinTeam(teamCode, (Coder) authn.getLoggedInUser())
	    				.getOrdinal();
	    	}
	    	catch (IllegalArgumentException ex)
	    	{
	    		throw new NoSuchTeam(teamCode);
	    	}
	    	catch (IllegalStateException ex)
	    	{
	    		throw new AlreadyAMember(teamCode);
	    	}
    	}
    	else
    		throw new AuthorizationFailure("coder"); 
    }
    
    @RequestMapping(value="{pageID}", method=RequestMethod.GET)
    public List<TeamMember> getTeam (@PathVariable("pageID") String pageID,
    	@RequestParam(name="shadow" ,required=false) Integer shadow)
    {
        Coder coder = null;
        if (shadow != null)
        {
        	if (authn.getLoggedInUser() instanceof Staff)
        		coder = getCoderInOurClub(shadow);
        	else
        		throw new AuthorizationFailure("staff member");
        }
        else
        	coder = (Coder) authn.getLoggedInUser();
        
        List<TeamMember> team = service.getTeam (pageID, coder);
        final int ID = coder.getID();
        team.stream().filter(tm -> tm.getCoder().getID() == ID)
        		.forEach(tm -> tm.setMe(true));
        return team;
   }
}
 