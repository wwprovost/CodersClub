package codersclub;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;

@Entity
public class Level
{
    public static final Level LEVEL_ZERO = 
        new Level (0, "green", null, null, null);

    @Id
    private int number;

    private String color;

    @OneToMany(mappedBy="level")
    @OrderBy("ordinal")
    private List<Activity> activities;

    private String description;
    private String whatToDo;
    private String requirements;
    private int points;

    public Level ()
    {
    }
    
    public Level (int number, String color, 
        String description, String whatToDo, String requirements)
    {
        this.number = number;
        this.color = color;
        this.description = description;
        this.whatToDo = whatToDo;
        this.requirements = requirements;
    }
    
    public int getNumber ()
    {
        return number;
    }

    public void setNumber (int number)
    {
        this.number = number;
    }

    public String getColor ()
    {
        return color;
    }

    public String getColorCapitalized ()
    {
        if (color.length () < 2)
            return color.toUpperCase ();
        
        return "" + Character.toUpperCase (color.charAt (0)) +
            color.substring (1);
    }

    public void setColor (String color)
    {
        this.color = color;
    }

    public List<Activity> getActivities ()
    {
        return activities;
    }

    public void setActivities (List<Activity> activities)
    {
        this.activities = activities;
    }

    public String getDescription ()
    {
        return description;
    }

    public void setDescription (String description)
    {
        this.description = description;
    }
    
    public String getWhatToDo ()
    {
        return whatToDo;
    }

    public void setWhatToDo (String whatToDo)
    {
        this.whatToDo = whatToDo;
    }
    
    public String getRequirements ()
    {
        return requirements;
    }

    public void setRequirements (String requirements)
    {
        this.requirements = requirements;
    }
    
    public int getPoints ()
    {
        return points;
    }

    public void setPoints (int points)
    {
        this.points = points;
    }

    @Override
    public String toString ()
    {
        return "Level " + number + " (" + color + ")";
    }
}
