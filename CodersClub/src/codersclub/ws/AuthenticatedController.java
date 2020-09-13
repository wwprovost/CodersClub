package codersclub.ws;

import org.springframework.beans.factory.annotation.Autowired;

import codersclub.Authn;
import codersclub.Club;
import codersclub.Coder;
import codersclub.CoderService;
import codersclub.StaffService;
import codersclub.ex.NotInYourClub;

public class AuthenticatedController {

	@Autowired
	protected Authn authn;
	
	@Autowired
	protected StaffService staffService;
	
	@Autowired
	protected CoderService coderService;

	public AuthenticatedController() {
		super();
	}

	protected Coder getCoderInOurClub(int ID) {
		Club club = authn.getLoggedInUser().getClub();
		Coder coder = coderService.getByID(ID);
		if (coder.getClub().getID() != club.getID())
			throw new NotInYourClub();
		
		return coder;
	}

}