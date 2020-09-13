package codersclub.ex;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class NotInYourClub
    extends RuntimeException 
{
    public NotInYourClub()
    {
        super("You can only make changes to your own club.");
    }
}