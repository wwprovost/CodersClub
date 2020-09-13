package codersclub;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

import codersclub.mail.MailTestSuite;
import codersclub.web.WebTestSuite;
import codersclub.ws.WSTestSuite;

@RunWith(Suite.class)
@SuiteClasses({
	MailTestSuite.class,
    PersistenceTestSuite.class,
    WebTestSuite.class,
    WSTestSuite.class
})
public class TestSuite {}
