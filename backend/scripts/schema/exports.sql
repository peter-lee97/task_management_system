CREATE DATABASE  IF NOT EXISTS `tms` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `tms`;
-- MySQL dump 10.13  Distrib 8.0.38, for macos14 (arm64)
--
-- Host: localhost    Database: tms
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `accountStatus` varchar(30) DEFAULT 'active',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Application`
--

DROP TABLE IF EXISTS `Application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Application` (
  `App_Acronym` varchar(50) NOT NULL,
  `App_Description` text,
  `App_Rnumber` int NOT NULL,
  `App_startDate` int NOT NULL,
  `App_endDate` int NOT NULL,
  `App_permit_Create` varchar(50) DEFAULT 'PL',
  `App_permit_Open` varchar(50) DEFAULT NULL,
  `App_permit_toDoList` varchar(50) DEFAULT NULL,
  `App_permit_Doing` varchar(50) DEFAULT NULL,
  `App_permit_Done` varchar(50) DEFAULT NULL,
  `Task_id` varchar(100) DEFAULT NULL,
  `Task_plan` varchar(255) DEFAULT NULL,
  `Task_app` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`App_Acronym`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Plan`
--

DROP TABLE IF EXISTS `Plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Plan` (
  `Plan_MVP_name` varchar(255) NOT NULL,
  `Plan_app_Acronym` varchar(50) NOT NULL,
  `Plan_startDate` int NOT NULL,
  `Plan_endDate` int NOT NULL,
  `Plan_color` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`Plan_MVP_name`,`Plan_app_Acronym`),
  KEY `plan_ibfk_1` (`Plan_app_Acronym`),
  CONSTRAINT `plan_ibfk_1` FOREIGN KEY (`Plan_app_Acronym`) REFERENCES `Application` (`App_Acronym`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Task`
--

DROP TABLE IF EXISTS `Task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Task` (
  `Task_id` varchar(100) NOT NULL,
  `Task_plan` varchar(255) DEFAULT NULL,
  `Task_app_Acronym` varchar(50) NOT NULL,
  `Task_name` varchar(255) DEFAULT NULL,
  `Task_description` text,
  `Task_notes` mediumtext,
  `Task_state` varchar(10) NOT NULL,
  `Task_creator` varchar(50) NOT NULL,
  `Task_owner` varchar(50) NOT NULL,
  `Task_createDate` int NOT NULL,
  PRIMARY KEY (`Task_id`),
  KEY `Task_plan` (`Task_plan`),
  KEY `Task_app_Acronym` (`Task_app_Acronym`),
  CONSTRAINT `task_ibfk_1` FOREIGN KEY (`Task_plan`) REFERENCES `Plan` (`Plan_MVP_name`) ON DELETE SET NULL,
  CONSTRAINT `task_ibfk_2` FOREIGN KEY (`Task_app_Acronym`) REFERENCES `Application` (`App_Acronym`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UserGroup`
--

DROP TABLE IF EXISTS `UserGroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserGroup` (
  `username` varchar(50) NOT NULL DEFAULT '',
  `user_group` varchar(50) NOT NULL,
  PRIMARY KEY (`user_group`,`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-17 17:19:20
