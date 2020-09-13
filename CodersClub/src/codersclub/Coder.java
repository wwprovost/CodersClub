package codersclub;

import java.util.Date;
import java.util.List;
import java.util.stream.Stream;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Transient;

@Entity
public class Coder
    extends User
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID;
    
    @Column(name="group_id")
    private String group;
    
    private String parentEMail;
    private Integer enabledLevel;
    private String notes;
    private Integer seenNotebookMessage;
    private Date graduation;
    
    @Column(name="last_award_notification")
    private Date lastAwardNotification;
    
    @OneToMany(mappedBy="coder")
    @OrderBy("attended")
    private List<Attendance> attendance;

    @Transient
    private Date attendanceFrom;
    
    @Transient
    private Date attendanceTo;
    
    @Transient
    private boolean overdue;
    
    public Coder ()
    {
    }

    public Coder (Club club, String firstName, String lastName, String password, String parentEMail)
    {
        super (club, firstName, lastName, password);
        setParentEMail(parentEMail);
    }

    public int getID ()
    {
        return ID;
    }

    public void setID (int iD)
    {
        ID = iD;
    }
    
    // Coders don't have passwords anymore
    @Override
    public void setPassword(String password) 
    {
    	super.setPassword(null);
    }

    public String getGroup ()
    {
        return group;
    }

    public void setGroup (String group)
    {
        this.group = group;
    }
    
    public boolean isActive()
    {
        return group != null;
    }
    
    public String getParentEMail ()
    {
        return parentEMail;
    }

    public void setParentEMail (String parentEMail)
    {
		if (parentEMail != null && !parentEMail.matches("^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*\\.(\\w{2}|(com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum))$"))
			throw new IllegalArgumentException
				("Not a valid e-mail address: " + parentEMail);
		
        this.parentEMail = parentEMail;
    }
    
    public Integer getEnabledLevel ()
    {
        return enabledLevel != null ? enabledLevel : 0;
    }

    public void setEnabledLevel (Integer enabledLevel)
    {
        this.enabledLevel = enabledLevel;
    }
    
    public String getNotes ()
    {
        return notes;
    }

    public void setNotes (String notes)
    {
        this.notes = notes;
    }

    public Integer getSeenNotebookMessage ()
    {
        return seenNotebookMessage;
    }

    public void setSeenNotebookMessage (Integer seenNotebookMessage)
    {
        this.seenNotebookMessage = seenNotebookMessage;
    }

    public Date getGraduation()
    {
    	return graduation;
    }
    
    public void setGraduation(Date graduation) 
    {
    	this.graduation = graduation;
    }
    
    public Date getLastAwardNotification()
    {
    	return lastAwardNotification;
    }
    
    public void setLastAwardNotification(Date lastAwardNotification) 
    {
    	this.lastAwardNotification = lastAwardNotification;
    }
    
    public boolean hasSeenNotebookMessage ()
    {
        return seenNotebookMessage != null && seenNotebookMessage.intValue() != 0;
    }

    public void setAttendanceRange(Date from, Date to)
    {
    	attendanceFrom = from;
    	attendanceTo = to;
    }
    
    public Stream<Date> getAttendance ()
    {
        Stream<Date> result = attendance.stream ().map (Attendance::getAttended);
        if (attendanceFrom != null)
        	result = result.filter(a -> !a.before(attendanceFrom));
        if (attendanceTo != null)
        	result = result.filter(a -> !a.after(attendanceTo));
        
        return result;
    }
    
    public boolean isAttendedThisWeek ()
    {
        final long SIX_DAYS = 1000L * 60 * 60 * 24 * 6;
        return attendance.stream ().anyMatch (a -> 
            System.currentTimeMillis() - a.getAttended ().getTime() < SIX_DAYS);
    }
    
    public boolean isFirstLogin() {
        return attendance.size() < 2;
    }
    
    public boolean isOverdue ()
    {
    	return overdue;
    }
    
    public void setOverdue (boolean overdue)
    {
    	this.overdue = overdue;
    }
    
    @Override
    public boolean equals (Object other)
    {
        return other instanceof Coder &&
            ((Coder) other).getID () == ID;
    }
}
