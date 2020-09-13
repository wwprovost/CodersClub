package codersclub.web;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({
    CoachControllerTest.class,
    EntryPointTest.class,
    HistoryControllerTest.class
})
public class WebTestSuite {}
