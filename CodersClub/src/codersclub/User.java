package codersclub;

import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIgnore;

@MappedSuperclass
public class User
{
    @Size(min=1, max=32, message="Must be between 1 and 32 characters")
    private String firstName;
    
    @Size(min=1, max=32, message="Must be between 1 and 32 characters")
    private String lastName;

    @Size(min=1, max=32, message="Must be between 1 and 32 characters")
    private String password;
    
    @ManyToOne
    private Club club;
    
    public User ()
    {
    }

    public User (Club club, String firstName, String lastName, String password)
    {
        this.club = club;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
    }

    public Club getClub ()
    {
        return club;
    }

    public void setClub (Club club)
    {
        this.club = club;
    }

    public String getFirstName ()
    {
        return firstName;
    }

    public void setFirstName (String firstName)
    {
        this.firstName = firstName;
    }

    public String getLastName ()
    {
        return lastName;
    }

    public void setLastName (String lastName)
    {
        this.lastName = lastName;
    }

    // Accept passwords from HTTP client in some cases, but never send them:
    // @XmlTransient used to work but maybe a regression in Jackson?
    @JsonIgnore
    public String getPassword ()
    {
        return password;
    }

    public void setPassword (String password)
    {
        this.password = password;
    }

    public String getName ()
    {
        if (firstName == null)
            return lastName;
        
        if (lastName == null)
            return firstName;
        
        return firstName + " " + lastName;
    }
    
    public String getFirstOrOnlyName ()
    {
        return firstName != null ? firstName : lastName;
    }
    
    @Override
    public String toString ()
    {
        return getName ();
    }
}
