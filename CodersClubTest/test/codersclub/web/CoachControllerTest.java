package codersclub.web;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.web.servlet.ModelAndView;

import codersclub.AuthnTest;
import codersclub.Coder;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=WebTestConfig.class)
public class CoachControllerTest
{
	public static final String USERNAME_PIERCE_COACH = "1_Will_Provost";
	public static final String USERNAME_DEVO_COACH = "3_Phil_Durbin";
	
    @Autowired
    private CoachController controller;
    
    @SuppressWarnings("unchecked")
    @Test
    public void testGetChecklistsForGroup_Pierce() 
    {
    	AuthnTest.username = USERNAME_PIERCE_COACH;
        ModelAndView mav = controller.getChecklistsForGroup ("Group 1");
        List<Map<String,Object>> coders = 
            (List<Map<String,Object>>) mav.getModel ().get ("coders");
        assertEquals(3, coders.size());
        Map<String,Object> pair = coders.get (1); // 'auser4' first in alpha order
        Coder coder = (Coder) pair.get ("coder");
        assertEquals ("user1", coder.getLastName());
        Map<Integer,Boolean> completed = (Map<Integer,Boolean>) pair.get("completed");
        assertTrue(completed.get(1));
        assertFalse(completed.containsKey(3));
    }
    
    @SuppressWarnings("unchecked")
    @Test
    public void testGetChecklistsForGroup_Devo() 
    {
    	AuthnTest.username = USERNAME_DEVO_COACH;
        ModelAndView mav = controller.getChecklistsForGroup ("Group 1");
        List<Map<String,Object>> coders = 
            (List<Map<String,Object>>) mav.getModel ().get ("coders");
        assertEquals(1, coders.size());
        Map<String,Object> pair = coders.get (0);
        Coder coder = (Coder) pair.get ("coder");
        assertEquals ("user1", coder.getLastName());
        Map<Integer,Boolean> completed = (Map<Integer,Boolean>) pair.get("completed");
        assertFalse(completed.containsKey(1));
    }
}
