package codersclub;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Staff
    extends User
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID;

    private Integer coach;
    private Integer admin;
    private Integer senior;
    
    private String eMail;
    
    public Staff ()
    {
    }

    public Staff (Club club, String firstName, String lastName, String password)
    {
        super (club, firstName, lastName, password);
    }

    public int getID ()
    {
        return ID;
    }
    public void setID (int iD)
    {
        ID = iD;
    }
    
    public boolean isCoach() 
    {
        return coach != null && coach == 1;
    }
    
    public void setCoach(boolean coach) 
    {
        this.coach = coach ? 1 : 0;
    }

    public boolean isAdmin() 
    {
        return admin != null && admin == 1;
    }
    
    public void setAdmin(boolean admin) 
    {
        this.admin = admin ? 1 : 0;
    }
    
    public boolean isSenior() 
    {
        return senior != null && senior == 1;
    }
    
    public void setSenior(boolean senior) 
    {
        this.senior = senior ? 1 : 0;
    }
    
    public String getEMail() 
    {
    	return eMail;
    }
     
    public void setEMail(String eMail)
    {
		if (eMail != null && !eMail.matches("^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*\\.(\\w{2}|(com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum))$"))
			throw new IllegalArgumentException
				("Not a valid e-mail address: " + eMail);
		
    	this.eMail = eMail;
    }
}
