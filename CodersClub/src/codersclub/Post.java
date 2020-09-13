package codersclub;

import java.text.SimpleDateFormat;
import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
public class Post
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID;
    
    private String what;
    
    @Temporal(TemporalType.DATE)
    private Date when = new Date();
    
    @Temporal(TemporalType.TIME)
    private Date when2 = new Date();
    
    @ManyToOne
    private Coder coder;

    public Post () {}
    
    public Post (String what, Coder coder)
    {
        this.what = what;
        this.coder = coder;
    }
    
    public int getID ()
    {
        return ID;
    }

    public void setID (int iD)
    {
        ID = iD;
    }

    public String getWhat ()
    {
        return what;
    }

    public void setWhat (String what)
    {
        this.what = what;
    }

    public Date getWhen ()
    {
        return when;
    }

    public void setWhen (Date when)
    {
        this.when = when;
    }

    public Date getWhen2 ()
    {
        return when2;
    }

    public void setWhen2 (Date when2)
    {
        this.when2 = when2;
    }

    public Coder getCoder ()
    {
        return coder;
    }

    public void setCoder (Coder coder)
    {
        this.coder = coder;
    }
    
    public String getDateAndTime ()
    {
        SimpleDateFormat dateFormatter = new SimpleDateFormat("MMMM d");
        SimpleDateFormat timeFormatter = new SimpleDateFormat(", h:mm a");
        return dateFormatter.format(when) + timeFormatter.format(when2);
    }
}
