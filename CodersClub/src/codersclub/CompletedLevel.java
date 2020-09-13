package codersclub;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.xml.bind.annotation.XmlTransient;

@Entity
public class CompletedLevel
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID;

    @XmlTransient
    @ManyToOne
    private Coder coder;

    @ManyToOne
    private Level level;

    private String grantedBy;

    @Temporal(TemporalType.DATE)
    private Date dateCompleted;
    
    private String explanation;

    public CompletedLevel ()
    {
    }
    
    public CompletedLevel (Coder coder, Level level, String grantedBy)
    {
        this (coder, level, grantedBy, new Date ());
    }
    
    public CompletedLevel (Coder coder, 
        Level level, String grantedBy, Date dateCompleted)
    {
        this (coder, level, grantedBy, dateCompleted, null);
    }
    
    public CompletedLevel (Coder coder, 
        Level level, String grantedBy, String explanation)
    {
        this (coder, level, grantedBy, new Date (), explanation);
    }
    
    public CompletedLevel (Coder coder, Level level, 
        String grantedBy, Date dateCompleted, String explanation)
    {
        this.coder = coder;
        this.level = level;
        this.grantedBy = grantedBy;
        this.dateCompleted = dateCompleted;
        this.explanation = explanation;
    }
    
    public int getID ()
    {
        return ID;
    }

    public void setID (int iD)
    {
        ID = iD;
    }

    public Coder getCoder ()
    {
        return coder;
    }

    public void setCoder (Coder coder)
    {
        this.coder = coder;
    }

    public Level getLevel ()
    {
        return level;
    }

    public void setLevel (Level level)
    {
        this.level = level;
    }

    public String getGrantedBy ()
    {
        return grantedBy;
    }

    public void setGrantedBy (String grantedBy)
    {
        this.grantedBy = grantedBy;
    }

    public Date getDateCompleted ()
    {
        return dateCompleted;
    }

    public void setDateCompleted (Date dateCompleted)
    {
        this.dateCompleted = dateCompleted;
    }

    public String getExplanation ()
    {
        return explanation;
    }

    public void setExplanation (String explanation)
    {
        this.explanation = explanation;
    }
}
