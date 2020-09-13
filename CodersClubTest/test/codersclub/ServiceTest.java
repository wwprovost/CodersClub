package codersclub;

import static org.junit.Assert.*;

import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import codersclub.db.JPAService;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=PersistenceTestConfig.class)
public class ServiceTest
{
	@Autowired
	private Service service;
	
	@Autowired
	private JPAService<Club> clubService;
	
	public static void assertProgress(List<Service.Progress> progress)
	{
		assertEquals(6, progress.size());
		
		Service.Progress record1 = progress.get(1);
		assertEquals(1, record1.ID);
		assertEquals("pierce", record1.firstName);
		assertEquals("user1", record1.lastName);
		assertEquals("parent1@gmail.com", record1.parentEMail);
		assertEquals("Group 1", record1.group);
		assertEquals(5, record1.belts.size());
		
		Service.Belt belt1 = record1.belts.get(0);
		assertEquals(20180517, belt1.earned.intValue());
		assertEquals(2, belt1.points);
		for (int level = 1; level < 5; ++level)
		{
			assertNull(record1.belts.get(level).earned);
			assertEquals(0, record1.belts.get(level).points);
		}

		Service.Progress record2 = progress.get(2);
		assertEquals(2, record2.ID);
		assertEquals("pierce", record2.firstName);
		assertEquals("user2", record2.lastName);
		assertEquals("parent2@gmail.com", record2.parentEMail);
		assertEquals("Group 1", record2.group);
		assertEquals(5, record2.belts.size());

		assertNull(record2.belts.get(0).earned);
		assertEquals(2, record2.belts.get(0).points);
		for (int level = 1; level < 5; ++level)
		{
			assertNull(record2.belts.get(level).earned);
			assertEquals(0, record2.belts.get(level).points);
		}
	}
	
	@Test
	public void testGetProgress()
	{
		Club club = clubService.getByID(1);
		List<Service.Progress> progress = service.getProgress(club);
		assertProgress(progress);
	}
}