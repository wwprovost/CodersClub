package codersclub;

import javax.persistence.EntityManagerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import codersclub.db.JPAService;

@Configuration
public class Bootstraps
{
    @Autowired
    private EntityManagerFactory emFactory;

    public EntityManagerFactory emf() 
    {
        return emFactory;
    }
    
    @Bean
    public AttendanceService attendanceService ()
    {
        return new AttendanceService(emFactory);
    }
    
    @Bean
    public ClubService clubService ()
    {
        return new ClubService (emFactory);
    }
    
    @Bean
    public CoderService coderService ()
    {
        return new CoderService(emFactory);
    }
    
    @Bean
    public StaffService staffService ()
    {
        return new StaffService (emFactory);
    }
    
    @Bean
    public JPAService<Level> levelService ()
    {
        return new JPAService<> (emFactory, Level.class, "number");
    }
    
    @Bean
    public JPAService<Activity> activityService ()
    {
        return new JPAService<> (emFactory, Activity.class, "level.number", "ID");
    }
    
    @Bean
    public JPAService<CompletedActivity> completedActivitiesService ()
    {
        return new JPAService<> (emFactory, CompletedActivity.class);
    }
    
    @Bean
    public CompletedLevelService completedLevelService ()
    {
        return new CompletedLevelService (emFactory);
    }
    
    @Bean
    public JPAService<Post> postService ()
    {
        return new JPAService<> (emFactory, Post.class, "when", "when2");
    }
    
    @Bean
    public Service service ()
    {
        return new Service (emFactory);
    }
    
    @Bean
    public Authn authn()
    {
    	return new Authn();
    }
    
    @Bean
    public TeamService eamService()
    {
    	return new TeamService(emFactory);
    }
    
    @Bean
    public WorkService workService()
    {
    	return new WorkService(emFactory);
    }
}
