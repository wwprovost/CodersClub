package codersclub;

import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;

import codersclub.db.JPAService;

public class Authn
{
	private static final Logger LOG =
			Logger.getLogger(Authn.class.getName());
				
	@Autowired
	private HttpServletRequest request;
	
	@Autowired
	private JPAService<Club> clubService;
	
	@Autowired
	private CoderService coderService;
	
	@Autowired
	private UserService<Staff> staffService;
	
	public User getLoggedInUser()
	{
		String username = request.getRemoteUser();
        if (username == null)
            return null;

        String[] user = username.split ("_");
        Integer club_id = new Integer(user[0]);
        String firstName = user[1];
        String lastName = user[2];
        
        Club club = clubService.getByID(club_id);
        Coder coder = coderService.getByClubAndName(club, firstName, lastName);
        if (coder != null)
            return coder;
        else
        {
	        Staff staff = staffService.getByClubAndName(club, firstName, lastName);
	        if (staff != null)
	        	return staff;
	        else
	        	LOG.warning("HMM -- neither a coder nor a coach? " + 
	        			firstName + " " + lastName);
        }
        
        return null;
	}
}