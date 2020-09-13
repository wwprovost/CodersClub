package codersclub.web;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import codersclub.PersistenceTestConfig;

@Configuration
@Import({PersistenceTestConfig.class, WebTestConfig.Config.class})
public class WebTestConfig
{
    @Configuration
    @ComponentScan(basePackageClasses=CoderController.class)
    public static class Config
    {
    }
}
