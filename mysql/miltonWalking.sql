
CREATE DATABASE miltonWalking CHARACTER SET utf8 COLLATE utf8_general_ci;
use miltonWalking;

create table parents (
parentId varchar(255) primary key,
fullName varchar(255),
email varchar(255),
image varchar(600),
contact varchar(600),
password varchar(300),
createdOn timestamp not null,
modifiedOn timestamp not null,
totalStudents int(60),
totalTrips int(60),
isFirstTime int(60) default 1,
stopId int(60),
deviceToken varchar(600) default 0,
longitude varchar(255) default 0,
latitude varchar(255) default 0
);

create table routes (
routeId int(60) primary key auto_increment,
name varchar(255),
totalStops int(60),
startLocation varchar(255),
endLocation varchar(255),
createdOn timestamp not null,
isActive int(60) default 1
);

create table stops (
stopId int(60) primary key auto_increment,
routeId int(60),
name varchar(255),
location varchar(300),
createdOn timestamp not null,
FOREIGN KEY (routeId) REFERENCES routes(routeId)
);

create table groups (
groupId int(60) primary key auto_increment,
groupName varchar(255),
routeId int(60),
image varchar(600),
createdOn timestamp not null,
totalStudents int(60),
totalTrips int(60),
createdBy varchar(255),
FOREIGN KEY (routeId) REFERENCES routes(routeId)
);


create table trips (
tripId int(60) primary key auto_increment,
groupId int(60),
routeId int(60),
isSupervised int(60) default 0,
supervisorId varchar(255),
createdOn timestamp not null,
dueOn timestamp not null,
completedOn timestamp not null,
status varchar(255),
FOREIGN KEY (routeId) REFERENCES routes(routeId),
FOREIGN KEY (groupId) REFERENCES groups(groupId),
FOREIGN KEY (supervisorId) REFERENCES parents(parentId)
);

create table students (
studentId int(60) primary key auto_increment,
fullName varchar(255),
grade varchar(255),
parentId varchar(255),
image varchar(600),
schoolName varchar(255),
email varchar(255),
createdOn timestamp not null,
FOREIGN KEY (parentId) REFERENCES parents(parentId)
);


create table groupstudents (
id int(60) primary key auto_increment,
studentId int(60),
createdOn timestamp not null,
isActive int(60) default 1,
FOREIGN KEY (studentId) REFERENCES students(studentId)
);

create table tripStudents (
id int(60) primary key auto_increment,
studentId int(60),
tripId int(60),
stopId int(60),
status varchar(255),
isActive int(60) default 1,
createdOn timestamp not null,
modifiedOn timestamp not null,
FOREIGN KEY (studentId) REFERENCES students(studentId),
FOREIGN KEY (tripId) REFERENCES trips(tripId)
);

create table messages (
messageId int(60) primary key auto_increment,
groupId int(60),
senderId varchar(255),
createdOn timestamp not null,
status varchar(255),
FOREIGN KEY (groupId) REFERENCES groups(groupId),
FOREIGN KEY (senderId) REFERENCES parents(parentId)
);

create table notifications (
notificationId int(60) primary key auto_increment,
parentId varchar(255),
hasActions int(60) default 0,
message varchar(255),
payload JSON,
type varchar(255),
actions JSON,
status varchar(255),
dueOn timestamp not null,
FOREIGN KEY (parentId) REFERENCES parents(parentId)
);

CREATE TABLE approvedParentList(
id int(60) PRIMARY KEY auto_increment,
email varchar(255),
active int(60) DEFAULT 0,
modifiedOn timestamp not null
);


INSERT into approvedParentList(email) VALUES 
('rohanappzoro@gmail.com'),( 'milton@gmail.com'),('krishna.appzoro@gmail.com'),('chandrapal.appzoro@gmail.com'),
('asif.appzoro@gmail.com'),('jitendra.appzoro@gmail.com'),('prabhat.appzoro@gmail.com'),('kapil.appzoro@gmail.com');