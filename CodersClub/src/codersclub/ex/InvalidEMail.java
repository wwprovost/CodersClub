package codersclub.ex;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidEMail
    extends RuntimeException 
{
    public InvalidEMail(String eMail)
    {
        super("Not a valid e-mail address: " + eMail);
    }
}