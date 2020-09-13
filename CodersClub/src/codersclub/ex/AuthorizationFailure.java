package codersclub.ex;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class AuthorizationFailure
    extends RuntimeException 
{
    public AuthorizationFailure(String role)
    {
        super("You are not logged in as a " + role + ".");
    }
}