package codersclub;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Club
{
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int ID;
    
    private String nickname;
    private String fullName;
    private EMailConfig emailConfig;

    public Club ()
    {
    }

    public Club (String nickname, String fullName)
    {
        this.nickname = nickname;
        this.fullName = fullName;
    }

    public int getID ()
    {
        return ID;
    }

    public void setID (int iD)
    {
        ID = iD;
    }

    public String getNickname()
    {
        return nickname;
    }
    
    public void setNickname(String nickname)
    {
        this.nickname = nickname;
    }
    
    public String getFullName()
    {
        return fullName;
    }
    
    public void setFullName(String fullName)
    {
        this.fullName = fullName;
    }
    
    public EMailConfig getEMailConfig()
    {
        return emailConfig;
    }
    
    public void setEMailConfig(EMailConfig emailConfig)
    {
        this.emailConfig = emailConfig;
    }
    
    @Override
    public boolean equals (Object other)
    {
        return other instanceof Club &&
            ((Club) other).getID () == ID;
    }
}
