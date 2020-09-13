package codersclub;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Transient;

@Entity
public class TeamMember {

	@Id @GeneratedValue(strategy=GenerationType.IDENTITY)
	private int ID;
	
	@Column(name="team_code")
	private String teamCode;
	
	@Column(name="page_id")
	private String pageID;
	
	private int ordinal;
	private Coder coder;
	
	@Transient
	private boolean me;
	
	public TeamMember() {}
	
	public TeamMember(String teamCode, String pageID, int ordinal, Coder coder) 
	{
		this.teamCode = teamCode;
		this.pageID = pageID;
		this.ordinal = ordinal;
		this.coder = coder;
	}

	public int getID() {
		return ID;
	}

	public void setID(int iD) {
		ID = iD;
	}

	public String getPageID() {
		return pageID;
	}

	public void setPageID(String pageID) {
		this.pageID = pageID;
	}

	public String getTeamCode() {
		return teamCode;
	}

	public void setTeamCode(String teamCode) {
		this.teamCode = teamCode;
	}

	public int getOrdinal() {
		return ordinal;
	}

	public void setOrdinal(int ordinal) {
		this.ordinal = ordinal;
	}

	public Coder getCoder() {
		return coder;
	}

	public void setCoder(Coder coder) {
		this.coder = coder;
	}
	
	public boolean isMe() {
		return me;
	}
	
	public void setMe(boolean me) {
		this.me = me;
	}
}
