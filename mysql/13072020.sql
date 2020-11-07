-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: localhost    Database: miltonWalking
-- ------------------------------------------------------
-- Server version	5.7.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `approvedparentlist`
--

DROP TABLE IF EXISTS `approvedparentlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `approvedparentlist` (
  `id` int(60) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `active` int(60) DEFAULT '0',
  `modifiedOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `archive`
--

DROP TABLE IF EXISTS `archive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `archive` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` bigint(20) DEFAULT NULL,
  `fromModel` varchar(255) DEFAULT NULL,
  `originalRecord` longtext,
  `originalRecordId` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups` (
  `groupId` int(60) NOT NULL AUTO_INCREMENT,
  `groupName` varchar(255) DEFAULT NULL,
  `routeId` int(60) DEFAULT NULL,
  `image` varchar(600) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `totalStudents` int(60) DEFAULT NULL,
  `totalTrips` int(60) DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`groupId`),
  KEY `routeId` (`routeId`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`routeId`) REFERENCES `routes` (`routeId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groupstudents`
--

DROP TABLE IF EXISTS `groupstudents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groupstudents` (
  `id` int(60) NOT NULL AUTO_INCREMENT,
  `studentId` int(60) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isActive` int(60) DEFAULT '1',
  `stopId` int(60) DEFAULT NULL,
  `groupId` int(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `studentId` (`studentId`),
  CONSTRAINT `groupstudents_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `students` (`studentId`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `messageId` int(60) NOT NULL AUTO_INCREMENT,
  `groupId` int(60) DEFAULT NULL,
  `senderId` varchar(255) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`messageId`),
  KEY `groupId` (`groupId`),
  KEY `senderId` (`senderId`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`senderId`) REFERENCES `parents` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `notificationId` int(60) NOT NULL AUTO_INCREMENT,
  `parentId` varchar(255) DEFAULT NULL,
  `hasActions` int(60) DEFAULT '0',
  `message` varchar(255) DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `type` varchar(255) DEFAULT NULL,
  `actions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `status` varchar(255) DEFAULT NULL,
  `dueOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`notificationId`),
  KEY `parentId` (`parentId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`parentId`) REFERENCES `parents` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parents`
--

DROP TABLE IF EXISTS `parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parents` (
  `parentId` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `image` varchar(600) DEFAULT NULL,
  `contact` varchar(600) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedOn` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `totalStudents` int(60) DEFAULT NULL,
  `totalTrips` int(60) DEFAULT NULL,
  `isFirstTime` int(60) DEFAULT '1',
  `deviceToken` varchar(600) DEFAULT '0',
  `longitude` varchar(600) DEFAULT '0',
  `latitude` varchar(600) DEFAULT '0',
  `fullName` varchar(255) DEFAULT NULL,
  `stopId` int(60) DEFAULT NULL,
  `password` varchar(300) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `routes` (
  `routeId` int(60) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `totalStops` int(60) DEFAULT NULL,
  `startLocation` varchar(255) DEFAULT NULL,
  `endLocation` varchar(255) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isActive` int(60) DEFAULT '1',
  PRIMARY KEY (`routeId`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stops`
--

DROP TABLE IF EXISTS `stops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stops` (
  `stopId` int(60) NOT NULL AUTO_INCREMENT,
  `routeId` int(60) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `location` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`stopId`),
  KEY `routeId` (`routeId`),
  CONSTRAINT `stops_ibfk_1` FOREIGN KEY (`routeId`) REFERENCES `routes` (`routeId`)
) ENGINE=InnoDB AUTO_INCREMENT=196 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `studentId` int(60) NOT NULL AUTO_INCREMENT,
  `grade` varchar(255) DEFAULT NULL,
  `parentId` varchar(255) DEFAULT NULL,
  `image` varchar(600) DEFAULT NULL,
  `fullName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `schoolName` varchar(255) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`studentId`),
  KEY `parentId` (`parentId`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`parentId`) REFERENCES `parents` (`parentId`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tripStudents`
--

DROP TABLE IF EXISTS `tripStudents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tripStudents` (
  `id` int(60) NOT NULL AUTO_INCREMENT,
  `studentId` int(60) DEFAULT NULL,
  `tripId` int(60) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `isActive` int(60) DEFAULT '1',
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedOn` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `studentId` (`studentId`),
  KEY `tripId` (`tripId`),
  CONSTRAINT `tripstudents_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `students` (`studentId`),
  CONSTRAINT `tripstudents_ibfk_2` FOREIGN KEY (`tripId`) REFERENCES `trips` (`tripId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trips` (
  `tripId` int(60) NOT NULL AUTO_INCREMENT,
  `groupId` int(60) DEFAULT NULL,
  `routeId` int(60) DEFAULT NULL,
  `isSupervised` int(60) DEFAULT '0',
  `supervisorId` varchar(255) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dueOn` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `completedOn` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`tripId`),
  KEY `routeId` (`routeId`),
  KEY `groupId` (`groupId`),
  KEY `supervisorId` (`supervisorId`),
  CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`routeId`) REFERENCES `routes` (`routeId`),
  CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`),
  CONSTRAINT `trips_ibfk_3` FOREIGN KEY (`supervisorId`) REFERENCES `parents` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-07-13 20:38:40
