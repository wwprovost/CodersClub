package codersclub;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpSession;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=PersistenceTestConfig.class)
public class AuthnTest
{
	// Set this variously for tests that require different coders or coaches:
	public static String username = "1_test_user";
	
	public static class MockRequest 
		extends HttpServletRequestWrapper
	{
		public MockRequest()
		{
			super(Mockito.mock(HttpServletRequest.class));
		}
		
		@Override
		public String getRemoteUser()
		{
			return username.toLowerCase();
		}
	}
	
	// Set this to your own mock when setting up a test:
	public static Map<String,Object> sessionAttributes = new HashMap<>();
	public static void setSessionAttribute(String name, Object value)
	{
		sessionAttributes.clear();
		sessionAttributes.put(name, value);
	}
	
	public static HttpSession session;
	static
	{
		session = Mockito.mock(HttpSession.class);
		
	    Mockito.doAnswer(new Answer<Object>()
		    {
		        @Override
		        public Object answer(InvocationOnMock invocation) throws Throwable 
		        {
		            String key = (String) invocation.getArguments()[0];
		            return sessionAttributes.get(key);
		        }
		    }).when(session).getAttribute(Mockito.anyString());

	    Mockito.doAnswer(new Answer<Object>()
		    {
		        @Override
		        public Object answer(InvocationOnMock invocation) throws Throwable 
		        {
		            String key = (String) invocation.getArguments()[0];
		            Object value = invocation.getArguments()[1];
		            sessionAttributes.put(key, value);
		            return null;
		        }
		    }).when(session).setAttribute(Mockito.anyString(), Mockito.any());	

	    Mockito.doAnswer(new Answer<Object>()
	    {
	        @Override
	        public Object answer(InvocationOnMock invocation) throws Throwable 
	        {
	            String key = (String) invocation.getArguments()[0];
	            return sessionAttributes.remove(key);
	        }
	    }).when(session).removeAttribute(Mockito.anyString());
	}
	
	@Configuration
	public static class Config
	{
		@Bean
	    public HttpServletRequest getMockRequest()
	    {
	        return new MockRequest();
	    }
		
		@Bean
		public HttpSession getMockSession()
		{
			return session;
		}
	}
	
    @Autowired
    private Authn authn;
    
    @Test
    public void testGetLoggedInCoderPierce ()
        throws Exception
    {
    	username = "1_pierce_user2";
        User user = authn.getLoggedInUser ();
        assertTrue(user instanceof Coder);
        assertEquals("user2", user.getLastName());
    }

    @Test
    public void testGetLoggedInCoderLawrence ()
        throws Exception
    {
    	username = "2_lawrence_user1";
        User user = authn.getLoggedInUser ();
        assertTrue(user instanceof Coder);
        assertEquals("user1", user.getLastName());
    }
    
    @Test
    public void testGetLoggedInCoachPierce ()
        throws Exception
    {
    	username = "1_Stephen_Intille";
        User user = authn.getLoggedInUser ();
        assertTrue(user instanceof Staff);
        assertEquals("Intille", user.getLastName());
        assertFalse(((Staff) user).isAdmin());
    }
    
    @Test
    public void testGetLoggedInAdminPierce ()
        throws Exception
    {
    	username = "1_Will_Provost";
        User user = authn.getLoggedInUser ();
        assertTrue(user instanceof Staff);
        assertEquals("Provost", user.getLastName());
        assertTrue(((Staff) user).isAdmin());
    }
    
    @Test
    public void testGetLoggedInAdminLawrence ()
        throws Exception
    {
    	username = "2_Kirsten_Alper";
        User user = authn.getLoggedInUser ();
        assertTrue(user instanceof Staff);
        assertEquals("Alper", user.getLastName());
        assertTrue(((Staff) user).isAdmin());
    }
}