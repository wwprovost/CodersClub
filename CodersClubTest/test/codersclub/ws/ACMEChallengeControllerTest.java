package codersclub.ws;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;

public class ACMEChallengeControllerTest
{
	private ACMEChallengeController controller;
	
	@Before
	public void setUp()
	{
		controller = new ACMEChallengeController();
		controller.setRoot("test/codersclub/ws");
	}
	
	@Test
	public void testServeChallengeFile()
	{
		assertEquals("ChallengeCode", 
				controller.getChellengeCode("ChallengeFile.txt"));
	}
}
