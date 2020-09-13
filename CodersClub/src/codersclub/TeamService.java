package codersclub;

import java.security.SecureRandom;
import java.util.List;
import java.util.Random;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.NoResultException;

import codersclub.db.JPAService;

public class TeamService
    extends JPAService<TeamMember>
{
    public TeamService (EntityManagerFactory emf)
    {
        super (emf, TeamMember.class, "pageID", "ordinal");
    }

    /**
     * Generates a unique 6-digit team code.
     */
    public String generateTeamCode() 
    {
    	String code = null;
    	do
    	{
	    	final Random generator = new SecureRandom();
	    	int codeNumber = (int) (generator.nextDouble() * 1000000);
	    	code = String.format("%06d", codeNumber);
    	}
    	while (getAllByFilter("teamCode", code).size() > 0);
    	
    	return code;
    }
    
    /**
     * Creates a new team with the given page ID, ordinal 1, and the given coder.
     */
    public TeamMember createTeam(String pageID, Coder coder) 
    {
    	if (getTeam(pageID, coder).size() != 0)
    	{
    		throw new IllegalStateException
    			("Coder is already on a team for this activity.");
    	}
    	
    	return add(new TeamMember(generateTeamCode(), pageID, 1, coder));
    }
    
    /**
     * Adds a member to the given team.
     */
    public TeamMember joinTeam(String teamCode, Coder coder) 
    {
    	List<TeamMember> team = getAllByFilter("teamCode", teamCode);
    	if (team.size() == 0)
    	{
    		throw new IllegalArgumentException("No such team code: " + teamCode);
    	}
    	if (team.stream().filter(member -> member.getCoder().getID() == coder.getID()).findAny().isPresent())
    	{
    		throw new IllegalStateException("Already a member of team: " + teamCode);
    	}
    	
    	// Get rid of incomplete team for same page, or it will haunt you:
    	List<TeamMember> existingTeam = getTeam(team.get(0).getPageID(), coder);
    	for (TeamMember member : existingTeam)
    	{
    		remove(member);
    	}
    	
    	return add(new TeamMember(teamCode, team.get(0).getPageID(), 
    			team.stream().mapToInt(TeamMember::getOrdinal).max().getAsInt() + 1, 
    			coder));
    }
    
    /**
     * Gets the team for a given page ID and member coder.
     */
    public List<TeamMember> getTeam (String pageID, Coder coder)
    {
        EntityManager em = null;
        List<TeamMember> team = null;
        try
        {
            em = emf.createEntityManager ();
            team = em.createQuery ("select tm from TeamMember tm "
            		+ "where tm.teamCode = (select tm.teamCode from TeamMember tm "
                + "where tm.coder.ID = :coderID and tm.pageID = :pageID) "
                + "order by tm.ordinal", 
                TeamMember.class)
                .setParameter ("coderID", coder.getID ())
                .setParameter ("pageID", pageID)
                .getResultList ();
        }
        catch (NoResultException ex)
        {
            return null;
        }
        finally
        {
            if (em != null)
                em.close ();
        }
        
        return team;
    }
}
