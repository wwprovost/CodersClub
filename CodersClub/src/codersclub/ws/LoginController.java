package codersclub.ws;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import codersclub.Club;
import codersclub.db.JPAService;

@RestController
public class LoginController
{
    @Autowired
    private JPAService<Club> clubService;
    
    @RequestMapping("Clubs")
    public List<Club> getAllClubs()
    {
       return clubService.getAll();
    }
    
    /* Might revive this at some point, but we're just going with the
     * "I'm a coach" checkbox on the login page for now.
    @RequestMapping("AreYouACoach")
    public String areYouACoach(@RequestParam("club") int clubID,
    		@RequestParam("firstName") String firstName, 
    		@RequestParam("lastName") String lastName)
    {
    	System.out.println("Checking");
    	Club club = clubService.getByID(clubID);
        Coach coach = coachService.getByClubAndName(club, firstName, lastName);
        return coach != null ? "true" : "false";
    }
    */
}
 