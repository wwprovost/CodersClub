package codersclub;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name="MYWORK")
public class Work
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID;
    
    @ManyToOne
    private Coder coder;
    
    @Column(name="PAGE_ID")
    private String pageID;
    
    private String code;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date when = new Date();

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
    public String getPageID ()
    {
        return pageID;
    }
    public void setPageID (String pageID)
    {
        this.pageID = pageID;
    }
    public String getCode ()
    {
        return code;
    }
    public void setCode (String code)
    {
        this.code = code;
    }
    public Date getWhen()
    {
    	return when;
    }
    public void setWhen(Date when)
    {
    	this.when = when;
    }
    public void refreshDate()
    {
    	this.when = new Date();
    }
}
