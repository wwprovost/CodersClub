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
public class CompletedActivity
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID;

    @ManyToOne
    private Coder coder;

    @ManyToOne
    private Activity activity;
    
    private Integer step;

    private String certifiedBy;

    @Temporal(TemporalType.DATE)
    private Date dateCompleted;

    public CompletedActivity ()
    {
    }
    
    public CompletedActivity (Coder coder, Activity activity, 
        Integer step, String certifiedBy)
    {
        this (coder, activity, step, certifiedBy, new Date ());
    }
    
    public CompletedActivity (Coder coder, Activity activity, 
        Integer step, String certifiedBy, Date dateCompleted)
    {
        this.coder = coder;
        this.activity = activity;
        this.step = step;
        this.certifiedBy = certifiedBy;
        this.dateCompleted = dateCompleted;
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

    public Activity getActivity ()
    {
        return activity;
    }

    public void setActivity (Activity activity)
    {
        this.activity = activity;
    }
    
    public Integer getStep ()
    {
        return step;
    }
    
    public void setStep (Integer step)
    {
        this.step = step;
    }
    
    public boolean isAllSteps ()
    {
        return step == null;
    }

    public String getCertifiedBy ()
    {
        return certifiedBy;
    }

    public void setCertifiedBy (String certifiedBy)
    {
        this.certifiedBy = certifiedBy;
    }

    public Date getDateCompleted ()
    {
        return dateCompleted;
    }

    public void setDateCompleted (Date dateCompleted)
    {
        this.dateCompleted = dateCompleted;
    }
    
    @Override
    public boolean equals(Object other)
    {
        return other instanceof CompletedActivity &&
            ID == ((CompletedActivity) other).getID ();
    }
}
