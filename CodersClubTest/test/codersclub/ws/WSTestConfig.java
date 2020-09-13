package codersclub.ws;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import codersclub.PersistenceTestConfig;

@Configuration
@Import({PersistenceTestConfig.class, WSTestConfig.Config.class})
public class WSTestConfig
{
    @Configuration
    @ComponentScan(basePackageClasses=AdminController.class)
    public static class Config
    {
    }
}
