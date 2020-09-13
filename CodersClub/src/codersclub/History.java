package codersclub;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class History
{
    public static final String DATE_FORMAT = "MM/dd/yy";
    public static final String END_LINE = System.getProperty ("line.separator");
    
    public static class ActiveLevel
    {
        private Level level;
        private List<CompletedActivity> completedActivities =
            new ArrayList<> ();
        private boolean completed;
        private String explanation; // if coder didn't complete requirements
        
        public Level getLevel ()
        {
            return level;
        }
        public void setLevel (Level level)
        {
            this.level = level;
        }
        public List<CompletedActivity> getCompletedActivities ()
        {
            return completedActivities;
        }
        public void setCompletedActivities (List<CompletedActivity> completedActivities)
        {
            this.completedActivities = completedActivities;
        }
        public boolean isCompleted ()
        {
            return completed;
        }
        public void setCompleted (boolean completed)
        {
            this.completed = completed;
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
    
    private Coder coder;
    private List<ActiveLevel> activeLevels = new ArrayList<> (); 
        // sorted by level #
    
    public Coder getCoder ()
    {
        return coder;
    }

    public void setCoder (Coder coder)
    {
        this.coder = coder;
    } 

    public List<ActiveLevel> getActiveLevels ()
    {
        return activeLevels;
    } 

    public void setActiveLevels (List<ActiveLevel> activeLevels)
    {
        this.activeLevels = activeLevels;
    }
    
    public Level getHighestCompletedLevel ()
    {
        Level result = null;
        for (ActiveLevel activeLevel : activeLevels)
            if (activeLevel.completed)
                result = activeLevel.level;
        
        return result;
    }
    
    public String getAwardEMailSubject ()
    {
        String earnedBeltColor = null;
        for (ActiveLevel level : activeLevels)
            if (level.completed)
                earnedBeltColor = level.level.getColorCapitalized ();
        
        return String.format("%s is %s %s Belt!", coder.getName (), 
            earnedBeltColor.equals ("Orange") ? "an" : "a", earnedBeltColor);
    }
    
    public String getAwardEMailBody ()
    {
        SimpleDateFormat formatter = new SimpleDateFormat (DATE_FORMAT);

        String earnedBeltColor = null;
        for (ActiveLevel level : activeLevels)
            if (level.completed)
                earnedBeltColor = level.level.getColorCapitalized ();

        StringBuilder builder = new StringBuilder ();
        if (earnedBeltColor != null)
        {
            builder.append ("I'm happy to let you know that ")
                   .append (coder.getFirstOrOnlyName ())
                   .append (" has earned a");
            if (earnedBeltColor.equals ("Orange")) // OUCH
                builder.append ("n");
            builder.append (" ") 
                   .append (earnedBeltColor)
                   .append (" Belt in Coders' Club. Below is a summary of activities to date:")
                   .append (END_LINE)
                   .append (END_LINE);
        }
       
       builder.append ("Coder's Club member: ")
              .append (coder.getName ())
              .append (END_LINE)
              .append (END_LINE);
       
       for (ActiveLevel level : activeLevels)
       {
           builder.append (coder.getFirstOrOnlyName ()).append (" ");
           builder.append 
               (level.completed ? "has earned a" : "is now working on a");

           if (level.level.getColor ().equals ("orange")) // OUCH
                   builder.append ("n");
               builder.append (" ")
                      .append (level.level.getColor ());
               
           builder.append (level.completed 
               ? " belt by completing the following activities:"
               : " belt, and has completed the following activities so far:")
                  .append (END_LINE);
           
           for (CompletedActivity activity : level.completedActivities)
           {
               String name = activity.getActivity ().getFullNameNoEscape ();
               Integer step = activity.getStep();
               if (step != null)
                   name = name.replaceAll("s [0-9]+\\-[0-9]+", //TODO dead code?
                       " " + step.toString());
                   
               builder.append ("  ")
                      .append (formatter.format (activity.getDateCompleted ()))
                      .append (" ")
                      .append (name)
                      .append (END_LINE);
           }
           builder.append (END_LINE);
       }
       
       builder.append ("Please give ")
              .append (coder.getFirstOrOnlyName ())
              .append (" my congratulations! and we look forward to more coding challenges next week.")
              .append (END_LINE)
              .append (END_LINE)
              .append ("Cordially,") //TODO make this configurable
              .append (END_LINE);
       
       return builder.toString ();
    }
    
    public String getAwardEMail ()
    {
        return String.format("Parent e-mail: %s%n%nSubject: %s%n%n%s",
            coder.getParentEMail (), getAwardEMailSubject (),
            getAwardEMailBody ());
    }

    public String getCertificateBody ()
    {
        SimpleDateFormat formatter = new SimpleDateFormat (DATE_FORMAT);
        
        StringBuilder builder = new StringBuilder ();
        
        Level highestLevel = getHighestCompletedLevel ();
        int highestCompleted = highestLevel != null ? highestLevel.getNumber () : 0;
        
        builder.append ("<p>This certifies that <strong style=\"font-size: 115%;\" >")
        .append (coder.getName ())
        .append ("</strong> has completed coding activities and challenges as shown below as a member in good standing of the Pierce Coders' Club.");
    
        //TODO have to find a better way to deal with condensing
        // the Blockly Maze game steps than this ...
        final String BLOCKLY_MAZE = "Blockly maze game step";
        final ActivityGroup[] blocklyRanges = 
            {
            new ActivityGroup(BLOCKLY_MAZE + "s 1 -", "", 1), 
            new ActivityGroup(BLOCKLY_MAZE + "s 3 -", "", 2), 
            new ActivityGroup(BLOCKLY_MAZE + "s 5 -", "", 3) 
            };
            
        for (ActiveLevel level : activeLevels)
        {
            CompletedActivity topCompleted = null;
            Iterator<CompletedActivity> activities =
                level.getCompletedActivities ().iterator ();
            while (activities.hasNext ())
            {
                CompletedActivity completed = activities.next ();
                if (completed.getActivity ().getFullName ()
                        .startsWith (BLOCKLY_MAZE) &&
                    (topCompleted == null ||
                        completed.getActivity ().getStep () > topCompleted.getActivity ().getStep ()))
                {
                    topCompleted = completed;
                    activities.remove ();
                }
            }
            
            if (topCompleted != null)
            {
                topCompleted.getActivity ().setGroup 
                    (blocklyRanges[level.getLevel ().getNumber () - 1]);
                level.getCompletedActivities ().add (topCompleted);
            }
        }
        
        final int MAX_ACTIVITIES = 18;
        int activityCount = activeLevels.stream ()
            .mapToInt(lvl -> lvl.completedActivities.size())
            .sum();
        if (activityCount > MAX_ACTIVITIES)
        {
            Set<CompletedActivity> excluded = activeLevels.stream ()
                .flatMap (lvl -> lvl.getCompletedActivities ().stream ())
                .sorted ((x,y) -> x.getDateCompleted ().compareTo (y.getDateCompleted ()))
                .limit (activityCount - MAX_ACTIVITIES)
                .collect (Collectors.toSet ());
            
            Iterator<ActiveLevel> levels = activeLevels.iterator ();
            while (levels.hasNext ())
            {
                ActiveLevel level = levels.next ();
                for (CompletedActivity toExclude : excluded)
                    level.getCompletedActivities ().remove (toExclude);
                
                if (level.getCompletedActivities ().isEmpty ())
                    levels.remove ();
            }

            builder.append (" In fact, there are so many that we could only fit the most recent ones on the page!");
        }
            
        builder.append ("</p>");
        
        for (ActiveLevel level : activeLevels)
        {
            builder.append("<p>").append (coder.getFirstOrOnlyName ()).append (" ");
            String description = null;
            if (level.completed)
                description = "has earned a BELTCOLOR belt by completing the following activities:";
            else if (level.getLevel ().getNumber () < highestCompleted)
                description = "has completed the following activities at the BELTCOLOR-belt level:";
            else
                description = "is now working on a BELTCOLOR belt, and has completed the following activities so far:";

            if (level.level.getColor ().equals ("orange")) // OUCH
                description = description.replace ("a BELTCOLOR", "an BELTCOLOR");
            description = description.replace ("BELTCOLOR", level.level.getColor ());

            builder.append (description).append ("</p><table>");
            for (CompletedActivity completed : level.completedActivities)
            {
                String name = completed.getActivity ().getFullName ()
                    .replace("SCC", "Secret Coders' Club");
                builder.append ("<tr><td align=\"right\" >")
                       .append (formatter.format (completed.getDateCompleted ()))
                       .append ("</td><td>")
                       .append (name)
                       .append ("</td></tr>");
                
            }
            
            builder.append ("</table>");
        }
        
        return builder.toString ();
    }
}
