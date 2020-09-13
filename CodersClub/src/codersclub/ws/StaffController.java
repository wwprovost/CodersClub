package codersclub.ws;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import codersclub.AttendanceService;
import codersclub.Club;
import codersclub.Coder;
import codersclub.CompletedLevelService;
import codersclub.History;
import codersclub.Level;
import codersclub.Service;
import codersclub.Staff;
import codersclub.User;
import codersclub.WorkService;
import codersclub.ex.AuthenticationFailure;
import codersclub.ex.AuthorizationFailure;
import codersclub.ex.InadequatePassword;
import codersclub.ex.InvalidEMail;

@RestController
@RequestMapping("/Staff")
public class StaffController extends AuthenticatedController {
	
	public static final int COACHES_HANDBOOK_USER_ID = 1;
	
	public static class Activity {
		public String location;
	}

	public static class AttendanceRecord {
		public String first;
		public String last;
		public String parentEMail;
		public String group;
		public List<String> attendance;
	}

	public static class BeltAward {
		public Coder coder;
		public String subject;
		public String body;

		public BeltAward(Coder coder, String subject, String body) {
			this.coder = coder;
			this.subject = subject;
			this.body = body;
		}
	}

	public static class Certificate {
		public String name;
		public String beltColor;
		public String recentActivities;
	}

	private static final Logger LOG = Logger.getLogger(StaffController.class.getName());

	@Autowired
	private AttendanceService attendanceService;

	@Autowired
	private Service service;

	@Autowired
	private CompletedLevelService completedLevelService;

	@Autowired
	private WorkService workService;

	@RequestMapping(value = "Profile", method = RequestMethod.GET)
	public Staff whoAmI() {
		User user = authn.getLoggedInUser();
		if (!(user instanceof Staff)) {
			throw new AuthorizationFailure("staff member");
		}

		return (Staff) user;
	}

	@RequestMapping(value = "Profile", method = RequestMethod.PATCH)
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void changeProfile(@RequestParam("eMail") String eMail) {
		try {
			Staff staff = (Staff) authn.getLoggedInUser();
			staff.setEMail(eMail);
			staffService.update(staff);
		} catch (IllegalArgumentException ex) {
			throw new InvalidEMail(eMail);
		}
	}

	@RequestMapping(value = "Password", method = RequestMethod.PATCH)
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void changePassword(@RequestParam("oldPassword") String oldPassword,
			@RequestParam("newPassword") String newPassword) {
		boolean goodPassword = newPassword != null && newPassword.length() >= 8 && newPassword.matches(".*[a-z].*")
				&& newPassword.matches(".*[A-Z].*") && newPassword.matches(".*[0-9].*");
		if (goodPassword) {
			Staff coach = (Staff) authn.getLoggedInUser();
			if (coach.getPassword().equals(oldPassword)) {
				coach.setPassword(newPassword);
				staffService.update(coach);
			} else {
				throw new AuthenticationFailure();
			}
		} else {
			throw new InadequatePassword();
		}
	}

	@RequestMapping(value = "Groups", method = RequestMethod.GET)
	public List<String> getGroups() {
		return coderService.getGroups(authn.getLoggedInUser().getClub());
	}

	/**
	 * Filters out the "Coaches' Handbook" user.
	 */
	@RequestMapping(value = "Coders", method = RequestMethod.GET)
	public List<Coder> getCoders() {
		List<Coder> coders = 
				coderService.getAllByClub(authn.getLoggedInUser().getClub());
		
		Coder coachesHandbook = new Coder();
		coachesHandbook.setID(COACHES_HANDBOOK_USER_ID);
		coders.remove(coachesHandbook);
		
		return coders;
	}

	@RequestMapping(value = "Coders/{coderID}", method = RequestMethod.GET)
	public Coder getCoder(@PathVariable("coderID") int coderID) {
		return getCoderInOurClub(coderID);
	}

	@RequestMapping(value = "Activity/{coderID}", method = RequestMethod.GET)
	public Activity getActivity(@PathVariable("coderID") int coderID, HttpSession session) {
		Activity result = new Activity();
		String pageID = workService.getLatestActivity(getCoderInOurClub(coderID), new Date(session.getCreationTime()));
		if (pageID != null) {
			String URL = null;
			if (pageID.startsWith("BlocklyMaze"))
				URL = "BlocklyMaze/maze.html";
			else if (pageID.equals("SproutText:default"))
				URL = "Sprout/Text/index.html";
			else if (pageID.startsWith("SproutText"))
				URL = "Sprout/Text/index.html?challenge=" + pageID.replace("SproutText:", "");
			else if (pageID.startsWith("SproutTeam"))
				URL = "Sprout/Team/index.html?challenge=" + pageID.replace("SproutTeam:", "");
			else if (pageID.startsWith("Sprout"))
				URL = "Sprout/index.html?challenge=" + pageID.replace("Sprout:", "");
			else if (pageID.startsWith("Playground"))
				URL = "Chutes/Playground/index.html";
			else if (pageID.startsWith("Dicey"))
				URL = pageID.substring(0, "Dicey/Game".length() + 1).replace(":", "/") + ".html";
			else
				URL = pageID.replace(":", "/") + ".html";

			result.location = URL;
		}

		return result;
	}

	@RequestMapping("Attendance")
	public List<AttendanceRecord> getAttendance(@RequestParam(value = "from", required = false) String from,
			@RequestParam(value = "to", required = false) String to) {
		final SimpleDateFormat parser = new SimpleDateFormat("yyyy-MM-dd");
		final SimpleDateFormat formatter = new SimpleDateFormat("M/d/yy");

		Date fromDate = null;
		try {
			if (from != null)
				fromDate = parser.parse(from);
		} catch (ParseException ex) {
			LOG.warning("Couldn't parse 'from' date of " + from + "; leaving this end of the range open.");
		}

		Date toDate = null;
		try {
			if (to != null)
				toDate = parser.parse(to);
		} catch (ParseException ex) {
			LOG.warning("Couldn't parse 'to' date of " + from + "; leaving this end of the range open.");
		}

		List<AttendanceRecord> result = new ArrayList<>();
		for (Coder coder : attendanceService.getAttendance(authn.getLoggedInUser().getClub(), fromDate, toDate)) {
			if (coder.getGroup() != null) {
				AttendanceRecord record = new AttendanceRecord();
				record.first = coder.getFirstName();
				record.last = coder.getLastName();
				record.parentEMail = coder.getParentEMail();
				record.group = coder.getGroup();
				record.attendance = coder.getAttendance().map(d -> formatter.format(d)).collect(Collectors.toList());
				result.add(record);
			}
		}

		return result;
	}

	@RequestMapping("Progress")
	public List<Service.Progress> getProgress() {
		Club club = authn.getLoggedInUser().getClub();
		return service.getProgress(club);
	}

	@RequestMapping("BeltAwards")
	public ResponseEntity<?> getBeltAwards(@RequestParam(value = "since", required = false) String since) {
		final SimpleDateFormat parser = new SimpleDateFormat("yyyy-MM-dd");

		Date sinceDate = new Date(1L);
		if (since != null)
			try {
				if (since != null)
					sinceDate = parser.parse(since);
			} catch (ParseException ex) {
				return new ResponseEntity<String>("Couldn't parse 'from' date of " + since, HttpStatus.BAD_REQUEST);
			}

		return new ResponseEntity<List<BeltAward>>(completedLevelService.getAllSince(sinceDate).stream()
				.map(completed -> service.getHistory(completed.getCoder()))
				.map(history -> new BeltAward(history.getCoder(), history.getAwardEMailSubject(),
						history.getAwardEMailBody() + authn.getLoggedInUser().getFirstName() + "\n\n"))
				.collect(Collectors.toList()), HttpStatus.OK);
	}

	private List<Certificate> getCertificates(List<Coder> coders) {
		return coders.stream().map(coder -> {
			Certificate certificate = new Certificate();
			certificate.name = coder.getFirstOrOnlyName();
			History history = service.getHistory(coder);
			Level highestCompletedLevel = history.getHighestCompletedLevel();
			if (highestCompletedLevel != null)
				certificate.beltColor = highestCompletedLevel.getColor();
			certificate.recentActivities = history.getCertificateBody();
			return certificate;
		}).collect(Collectors.toList());
	}

	@RequestMapping(value = "Certificates", params = "coder")
	public List<Certificate> getCertificateForCoder(@RequestParam("coder") int coderID) {
		return getCertificates(Collections.singletonList(getCoderInOurClub(coderID)));
	}

	@RequestMapping(value = "Certificates", params = "group")
	public List<Certificate> getCertificatesForGroup(@RequestParam("group") String group) {
		return getCertificates(coderService.getGroupOfCoders(whoAmI().getClub(), group));
	}

	@RequestMapping(value = "Certificates")
	public List<Certificate> getCertificatesForActiveCoders() {
		Club club = whoAmI().getClub();
		return getCertificates(coderService.getGroups(club).stream()
				.flatMap(group -> coderService.getGroupOfCoders(club, group).stream()).collect(Collectors.toList()));
	}
}
