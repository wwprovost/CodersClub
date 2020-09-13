package codersclub.mail;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({
    MockMailerTest.class,
    SMTPMailerTest.class
})
public class MailTestSuite {}
