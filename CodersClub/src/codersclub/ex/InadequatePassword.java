package codersclub.ex;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InadequatePassword
    extends RuntimeException 
{
    public InadequatePassword()
    {
        super("Passwords should be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit.");
    }
}