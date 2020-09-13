package codersclub;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({
    AttendanceServiceTest.class,
	AuthnTest.class,
	ClubServiceTest.class,
    CoderLifecycleTest.class,
    CoderServiceTest.class,
    ServiceTest.class,
    StaffTest.class,
    StaffServiceTest.class,
    WorkServiceTest.class
})
public class PersistenceTestSuite {}
