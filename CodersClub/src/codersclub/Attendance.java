package codersclub;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
public class Attendance
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID;

    @ManyToOne
    private Coder coder;
    
    @Temporal(TemporalType.DATE)
    private Date attended;
    
    public Attendance ()
    {
    }

    public Attendance (Coder coder, Date attended)
    {
        this.coder = coder;
        this.attended = attended;
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

    public Date getAttended ()
    {
        return attended;
    }

    public void setAttended (Date attended)
    {
        this.attended = attended;
    }
}
