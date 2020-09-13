package codersclub;

import org.junit.Test;

public class StaffTest {

	private Staff staffer = new Staff();
	
	@Test
	public void testSetEMail_Good1() {
		staffer.setEMail("provost@tiac.net");
	}
	
	@Test
	public void testSetEMail_Good() {
		staffer.setEMail("barnes.jonathan@icloud.com");
	}

	@Test
	public void testSetEMail_Null() {
		staffer.setEMail(null);
	}
	
	@Test(expected=IllegalArgumentException.class)
	public void testSetEMail_Bad1() {
		staffer.setEMail("provost");
	}
	
	@Test(expected=IllegalArgumentException.class)
	public void testSetEMail_Bad2() {
		staffer.setEMail("gmail.com");
	}

	@Test(expected=IllegalArgumentException.class)
	public void testSetEMail_Empty() {
		staffer.setEMail("");
	}
}
