package codersclub;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.stereotype.Controller;

@Controller
@Import({AuthnTest.Config.class, PersistenceTestConfig.Config.class, Bootstraps.class})
public class PersistenceTestConfig
{
    public static final String JBDC_DRIVER = "org.apache.derby.jdbc.EmbeddedDriver";
    public static final String JBDC_URL = "jdbc:derby:memory:CodersClub;create=true";
    public static final String JBDC_USERNAME = "CodersClub";
    public static final String JBDC_PASSWORD = "CodersClub";

    public static boolean done = false;
    public static EntityManagerFactory emFactory = null;
    
    @Configuration
    public static class Config
    {
        @Bean
        public EntityManagerFactory emf() 
            throws Exception
        {
            if (!done)
            {
                setUpDatabase();
                done = true;
                emFactory = Persistence.createEntityManagerFactory("CodersClubTest");
            }
            
            return emFactory;
        }
    }
    
    public static void runScript(Statement stmt, String filename)
        throws Exception
    {
        try
        (
            BufferedReader in = new BufferedReader(new InputStreamReader
                (PersistenceTestConfig.class.getResourceAsStream (filename)));
        )
        {
            in.lines ()
                .filter (SQL -> !SQL.startsWith("--"))
                .filter (SQL -> !SQL.equals (""))
                .map (SQL -> SQL.endsWith(";") ? SQL.substring(0, SQL.length () - 1) : SQL)
                .forEach (SQL -> { 
                        System.out.println(SQL);
                        try { stmt.executeUpdate (SQL); }
                        catch (SQLException ex) { ex.printStackTrace (); } 
                    });
        }
    }
    
    public static void setUpDatabase ()
        throws Exception
    {
        try
        (
            Connection conn = DriverManager.getConnection
                (JBDC_URL, JBDC_USERNAME, JBDC_PASSWORD);
            Statement stmt = conn.createStatement();
        )
        {
            runScript(stmt, "createDB.sql");
            runScript(stmt, "populateDB.sql");
        }
    }
}
