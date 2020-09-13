package codersclub.ex;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class AuthenticationFailure
    extends RuntimeException 
{
    public AuthenticationFailure()
    {
        super("Password is incorrect for the current user.");
    }
}