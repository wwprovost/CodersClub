package codersclub.ex;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class AdminSelfDestruction
    extends RuntimeException 
{
    public AdminSelfDestruction()
    {
        super("You can't remove yourself as an administrator.");
    }
}