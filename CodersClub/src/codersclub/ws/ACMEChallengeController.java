package codersclub.ws;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ACMEChallengeController
{
	private static Logger LOG = 
			Logger.getLogger(ACMEChallengeController.class.getName()); 
			
	private String root;
	
	public String getRoot()
	{
		return root;
	}
	
	public void setRoot(String root)
	{
		this.root = root;
	}
	
    @RequestMapping("{filename}")
    public String getChellengeCode(@PathVariable("filename") String filename)
    {
    	try
    	{
    		return new String(Files.readAllBytes(Paths.get(root + "/" + filename)));
    	}
    	catch (Exception ex)
    	{
    		LOG.log(Level.SEVERE, "Couldn't read ACME challenge file.", ex);
    	}
    	
    	return "Sorry, failed to read challenge file.";
    }
}
  