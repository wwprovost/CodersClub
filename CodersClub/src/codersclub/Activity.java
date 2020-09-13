package codersclub;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@Entity
public class Activity
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID; 

    @ManyToOne
    private Level level;

    private int ordinal;
    private String name;
    private String description; // include teaching activities
    private String URL; // so this may be null
    private Integer step;
    private Integer points;
    private Integer inUse;
    private Integer optional;
    
    private ActivityGroup group;
    
    public Activity ()
    {
    }
    
    public Activity (Level level, int ordinal,
        String name, String description)
    {
        this (level, ordinal, name, description, null);
    }
    
    public Activity (Level level, int ordinal, 
        String name, String description, String URL)
    {
        this.level = level;
        this.ordinal = ordinal;
        this.name = name;
        this.description = description;
        this.URL = URL;
    }
    
    public int getID ()
    {
        return ID;
    }
    public void setID (int iD)
    {
        ID = iD;
    }
    public Level getLevel ()
    {
        return level;
    }
    public void setLevel (Level level)
    {
        this.level = level;
    }
    public int getOrdinal ()
    {
        return ordinal;
    }
    public void setOrdinal (int ordinal)
    {
        this.ordinal = ordinal;
    }
    public String getName ()
    {
        return name;
    }
    public String getNameEscaped ()
    {
        return escape(name);
    }
    public void setName (String name)
    {
        this.name = name;
    }
    public String getDescription ()
    {
        return description;
    }
    public String getDescriptionEscaped ()
    {
        return escape(description);
    }
    public void setDescription (String description)
    {
        this.description = description;
    }
    public String getURL ()
    {
        return URL;
    }
    public void setURL (String uRL)
    {
        URL = uRL;
    }
    
    public Integer getStep ()
    {
        return step;
    }
    
    public void setStep(Integer step)
    {
        this.step = step;
    }
    
    public Integer getPoints ()
    {
        return points;
    }
    
    public void setPoints(Integer points)
    {
        this.points = points;
    }
    
    public ActivityGroup getGroup()
    {
        return group;
    }
    
    public void setGroup(ActivityGroup group)
    {
        this.group = group;
    }

    public boolean isInUse() 
    {
        return inUse != null && inUse == 1;
    }
    
    public void setInUse(boolean inUse)
    {
        this.inUse = inUse ? 1 : 0;
    }
    
    public boolean isOptional() 
    {
        return optional != null && optional == 1;
    }
    
    public void setOptional(boolean optional)
    {
        this.optional = optional ? 1 : 0;
    }
    
    public String getShortNameNoEscape() //TODO refactor this and getShortName()
    {
        StringBuilder shortName = new StringBuilder();
        
        if (step != null)
        {
            shortName.append(group.getStepName())
                .append(' ').append(step);
            if (name != null && name.length() != 0)
                shortName.append(", ");
        }
        
        if (name != null && name.length() != 0)
            shortName.append(name);
        
        return shortName.toString ();
    }
    
    public String getShortName()
    {
        StringBuilder shortName = new StringBuilder();
        
        if (step != null)
        {
            shortName.append(group.getStepName())
                .append(' ').append(step);
            if (name != null && name.length() != 0)
                shortName.append(", ");
        }
        
        if (name != null && name.length() != 0)
            shortName.append(name);
        
        return shortName.toString ()
            .replace ("'", "&apos;").replace ("\"", "&quot;");
    }
    
    public String getFullNameNoEscape() //TODO refactor this and getFullName()
    {
        StringBuilder fullName = new StringBuilder();
        
        if (group != null)
        {
            fullName.append(group.getName()).append(' ');
        }
        
        return fullName.toString () + getShortNameNoEscape();
    }
    
    public String getFullName()
    {
        StringBuilder fullName = new StringBuilder();
        
        if (group != null)
        {
            fullName.append(group.getName()).append(' ');
        }
        
        return fullName.toString ()
            .replace ("'", "&apos;").replace ("\"", "&quot;")
                + getShortName();
    }
    
    @Override
    public String toString ()
    {
        return getFullName();
    }
    
    private static String escape(String value)
    {
        return value.replace ("'", "\\'");
    }
}
