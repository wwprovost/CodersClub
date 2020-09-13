package codersclub.ws;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({
	ACMEChallengeControllerTest.class,
    AdminControllerTest.class,
    EMailControllerTest.class,
    StaffControllerTest.class,
    WorkControllerTest.class
})
public class WSTestSuite {}
