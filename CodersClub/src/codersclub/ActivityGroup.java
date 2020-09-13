package codersclub;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="activity_group")
public class ActivityGroup
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID;
    
    private String name;
    
    @Column(name="step_name")
    private String stepName;
    
    private Integer ordinal;

    public ActivityGroup () {}
    
    public ActivityGroup (String name, String stepName, Integer ordinal)
    {
        this.name = name;
        this.stepName = stepName;
        this.ordinal = ordinal;
    }
    
    public int getID ()
    {
        return ID;
    }

    public void setID (int iD)
    {
        ID = iD;
    }

    public String getName ()
    {
        return name;
    }

    public void setName (String name)
    {
        this.name = name;
    }


    public String getStepName ()
    {
        return stepName;
    }

    public void setStepName (String stepName)
    {
        this.stepName = stepName;
    }

    public Integer getOrdinal ()
    {
        return ordinal;
    }

    public void setOrdinal (Integer ordinal)
    {
        this.ordinal = ordinal;
    }
}
