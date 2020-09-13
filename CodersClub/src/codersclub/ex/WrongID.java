package codersclub.ex;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class WrongID
    extends RuntimeException 
{
    public WrongID()
    {
        super("The request ID is not the ID of the provided object.");
    }
}