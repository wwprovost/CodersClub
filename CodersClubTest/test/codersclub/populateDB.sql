set schema CodersClub;

insert into emailconfig (host, port, sender, username) values ('smtpauth.earthlink.net', 587, 'provost@tiac.net', 'provost@tiac.net');
insert into emailconfig (host, port, sender, username) values ('hivehacker.com', 25, 'devo@hivehacker.com', 'devo@hivehacker.com');

insert into club (nickname, fullname, emailconfig_id) values ('Pierce', 'Pierce Elementary School', 1);
insert into club (nickname, fullname) values ('Lawrence', 'Lawrence Elementary School');
insert into club (nickname, fullname, emailconfig_id) values ('Devo', 'Devotion Elementary School', 2);
insert into club (nickname, fullname) values ('Doom', 'Club to be erased');

insert into coder (club_id, firstname, lastname, password, parentemail, group_id) values (1, 'pierce', 'user1', '', 'parent1@gmail.com', 'Group 1');
insert into coder (club_id, firstname, lastname, password, parentemail, group_id) values (1, 'pierce', 'user2', '', 'parent2@gmail.com', 'Group 1');
insert into coder (club_id, firstname, lastname, password, parentemail, group_id) values (1, 'pierce', 'user3', '', 'parent3@gmail.com', 'Group 2');
insert into coder (club_id, firstname, lastname, password, parentemail, group_id, graduation) values (1, 'pierce', 'auser4', '', 'parent2@gmail.com', 'Group 1', '2099-07-01');
insert into coder (club_id, firstname, lastname, password, parentemail, group_id, graduation) values (1, 'pierce', 'user5', '', 'parent5@gmail.com', 'AAA Group', '2019-07-01');
insert into coder (club_id, firstname, lastname, password, parentemail) values (1, 'pierce', 'user6', '', 'parent6@gmail.com');
insert into coder (club_id, firstname, lastname, password, parentemail, group_id) values (2, 'lawrence', 'user1', '', 'parent@gmail.com', 'Group 1');
insert into coder (club_id, firstname, lastname, password, parentemail, group_id) values (3, 'devo', 'user1', '', 'parent@gmail.com', 'Group 1');
insert into coder (club_id, firstname, lastname, password, parentemail, group_id) values (4, 'doom', 'user1', '', 'parent@gmail.com', 'Group 1');
insert into coder (club_id, firstname, lastname, password, parentemail, group_id) values (4, 'doom', 'user2', '', 'parent@gmail.com', 'Group 1');
insert into coder (club_id, firstname, lastname, password, parentemail, group_id) values (4, 'doom', 'user3', '', 'parent@gmail.com', 'Group 2');
insert into coder (club_id, firstname, lastname, password, parentemail) values (4, 'doom', 'user4', '', 'parent@gmail.com');

insert into staff (club_id, firstname, lastname, password, coach, admin, senior, email) values (1, 'Will', 'Provost', '', 1, 1, 1, 'provost@tiac.net');
insert into staff (club_id, firstname, lastname, password, coach, admin, senior, email) values (1, 'Andrew', 'Kuklewicz', '', 1, 1, 1, 'kuk');
insert into staff (club_id, firstname, lastname, password, coach, admin, senior, email) values (1, 'Stephen', 'Intille', '', 1, 0, 0, 'int');
insert into staff (club_id, firstname, lastname, password, coach, admin, senior, email) values (2, 'Harold', 'Price', '', 1, 1, 1, 'harold');
insert into staff (club_id, firstname, lastname, password, coach, admin, senior, email) values (2, 'Kirsten', 'Alper', '', 0, 1, 0, 'alper');
insert into staff (club_id, firstname, lastname, password, coach, admin, senior, email) values (3, 'Phil', 'Durbin', '', 1, 1, 1, 'phil');
insert into staff (club_id, firstname, lastname, password, coach, admin, senior, email) values (3, 'Tyler', 'Vuylsteke', '', 1, 1, 1, 'tyler');
insert into staff (club_id, firstname, lastname, password, coach, admin, senior, email) values (4, 'Doctor', 'Doom', '', 1, 1, 1, 'doom');
insert into staff (club_id, firstname, lastname, password, coach, admin, senior, email) values (1, 'Alex', 'Nones', '', 0, 1, 0, 'alex');

insert into level (number, color, description, whattodo, requirements, points) values (1, 'white', '', '', '', 1);
insert into level (number, color, description, whattodo, requirements) values (2, 'yellow', '', '', '');
insert into level (number, color, description, whattodo, requirements) values (3, 'orange', '', '', '');
insert into level (number, color, description, whattodo, requirements) values (4, 'brown', '', '', '');
insert into level (number, color, description, whattodo, requirements) values (5, 'red', '', '', '');

insert into activity_group (id, name) values (1, 'Sprout');
insert into activity_group (id, name) values (2, 'Blockly Maze Game');

insert into activity (level_number, ordinal, name, description, url, group_id, points, inuse, optional) values (1, 1, 'Octagon', '', '', 1, 1, 1, 0);
insert into activity (level_number, ordinal, name, description, url, group_id, points, inuse, optional) values (1, 2, 'Decorative Border', '', '', 1, 1, 1, 0);
insert into activity (level_number, ordinal, name, description, url, group_id, points, inuse, optional) values (2, 1, '', '', '', 2, 1, 1, 0);

insert into completedactivity (coder_id, activity_id, certifiedby, datecompleted) values (1, 1, 'Will Provost', '2018-05-14');
insert into completedactivity (coder_id, activity_id, certifiedby, datecompleted) values (1, 2, 'Andrew Kuklewicz', '2018-05-14');
insert into completedactivity (coder_id, activity_id, certifiedby, datecompleted) values (2, 1, 'Will Provost', '2018-05-14');
insert into completedactivity (coder_id, activity_id, certifiedby, datecompleted) values (2, 2, 'Andrew Kuklewicz', '2018-05-14');

insert into completedlevel (coder_id, level_number, grantedby, datecompleted) values (1, 1, 'Will Provost', '2018-05-17');

insert into attendance (coder_id, attended) values (1, '2017-10-01');
insert into attendance (coder_id, attended) values (1, '2017-10-08');
insert into attendance (coder_id, attended) values (1, '2017-10-15');
insert into attendance (coder_id, attended) values (1, '2017-10-22');
insert into attendance (coder_id, attended) values (1, '2018-04-04');
insert into attendance (coder_id, attended) values (1, '2018-04-11');
insert into attendance (coder_id, attended) values (1, '2018-04-25');
insert into attendance (coder_id, attended) values (1, '2018-05-14');

insert into attendance (coder_id, attended) values (2, '2018-04-04');
insert into attendance (coder_id, attended) values (2, '2018-04-11');
insert into attendance (coder_id, attended) values (2, '2018-04-25');
insert into attendance (coder_id, attended) values (2, '2018-05-14');
insert into attendance (coder_id, attended) values (2, '2018-05-15');
insert into attendance (coder_id, attended) values (2, '2018-05-22');

-- Devo coder
insert into attendance (coder_id, attended) values (8, '2018-04-11');

insert into mywork (coder_id, page_id, code, when) values (1, 'x', 'left', '2018-09-01 00:00:00');
insert into mywork (coder_id, page_id, code, when) values (2, 'x', 'right', '2018-09-01 00:00:00');
insert into mywork (coder_id, page_id, code, when) values (5, 'NumberCrunch:Squares', 'X', '2018-09-01 00:00:00');
insert into mywork (coder_id, page_id, code, when) values (5, 'NumberCrunch:Fibonacci', 'Y', '2018-09-02 00:00:00');
insert into mywork (coder_id, page_id, code, when) values (6, 'NumberCrunch:Squares', 'X', '2018-09-01 00:00:00');
insert into mywork (coder_id, page_id, code, when) values (6, 'NumberCrunch:Fibonacci', 'Y', '2018-09-01 00:01:00');
insert into mywork (coder_id, page_id, code, when) values (6, 'NumberCrunch:language', 'Python', '2018-09-03 00:00:00');
insert into mywork (coder_id, page_id, code, when) values (9, 'NumberCrunch:Squares', 'Z', '2018-09-01 00:00:00');

insert into teammember (team_code, page_id, ordinal, coder_id) values('123456', 'x', 1, 1);
insert into teammember (team_code, page_id, ordinal, coder_id) values('123456', 'x', 2, 2);
insert into teammember (team_code, page_id, ordinal, coder_id) values('222222', 'y', 1, 3);
insert into teammember (team_code, page_id, ordinal, coder_id) values('222222', 'y', 2, 4);
insert into teammember (team_code, page_id, ordinal, coder_id) values('654321', 'z', 1, 5);
