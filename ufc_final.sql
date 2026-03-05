/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.22-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: ufc_analytics
-- ------------------------------------------------------
-- Server version	10.6.22-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `app_config`
--

DROP TABLE IF EXISTS `app_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_config` (
  `config_id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(50) NOT NULL,
  `config_value` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=141 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_config`
--

LOCK TABLES `app_config` WRITE;
/*!40000 ALTER TABLE `app_config` DISABLE KEYS */;
INSERT INTO `app_config` VALUES (1,'betting_enabled','false','Controla si las apuestas están habilitadas','2026-03-05 00:54:10'),(2,'current_event_id','6','ID del evento actual para apuestas','2026-02-14 03:40:22');
/*!40000 ALTER TABLE `app_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `betting_odds`
--

DROP TABLE IF EXISTS `betting_odds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `betting_odds` (
  `odds_id` int(11) NOT NULL AUTO_INCREMENT,
  `fight_id` int(11) NOT NULL,
  `fighter_id` int(11) DEFAULT NULL,
  `outcome_type` enum('fighter','draw','no_contest') DEFAULT 'fighter',
  `decimal_odds` decimal(5,2) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`odds_id`),
  KEY `fight_id` (`fight_id`),
  KEY `fighter_id` (`fighter_id`),
  KEY `idx_outcome_type` (`outcome_type`),
  CONSTRAINT `betting_odds_ibfk_1` FOREIGN KEY (`fight_id`) REFERENCES `fact_fights` (`fight_id`),
  CONSTRAINT `betting_odds_ibfk_2` FOREIGN KEY (`fighter_id`) REFERENCES `dim_fighters` (`fighter_id`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `betting_odds`
--

LOCK TABLES `betting_odds` WRITE;
/*!40000 ALTER TABLE `betting_odds` DISABLE KEYS */;
INSERT INTO `betting_odds` VALUES (1,1,2,'fighter',2.90,'2026-01-14 05:33:44'),(2,1,3,'fighter',1.42,'2026-01-14 05:33:44'),(46,1,NULL,'draw',10.00,'2026-01-15 13:01:09'),(77,1,NULL,'no_contest',15.00,'2026-01-24 04:53:15'),(82,17,36,'fighter',2.25,'2026-01-24 05:12:30'),(83,17,37,'fighter',1.67,'2026-01-24 05:12:30'),(84,21,44,'fighter',1.28,'2026-01-24 05:12:47'),(85,21,45,'fighter',3.75,'2026-01-24 05:12:47'),(86,18,38,'fighter',1.10,'2026-01-24 05:13:04'),(87,18,39,'fighter',7.25,'2026-01-24 05:13:04'),(88,22,46,'fighter',1.30,'2026-01-24 05:13:29'),(89,22,47,'fighter',3.60,'2026-01-24 05:13:29'),(90,19,40,'fighter',1.06,'2026-01-24 05:13:58'),(91,19,41,'fighter',9.50,'2026-01-24 05:13:58'),(92,23,48,'fighter',1.48,'2026-01-24 05:14:16'),(93,23,49,'fighter',2.70,'2026-01-24 05:14:16'),(94,24,50,'fighter',2.50,'2026-01-24 05:25:21'),(95,24,51,'fighter',1.57,'2026-01-24 05:25:21'),(96,20,42,'fighter',3.00,'2026-01-24 05:33:00'),(97,20,43,'fighter',1.40,'2026-01-24 05:33:00'),(98,25,52,'fighter',1.73,'2026-01-31 19:38:54'),(99,25,53,'fighter',2.10,'2026-01-31 19:38:54'),(100,26,54,'fighter',1.73,'2026-01-31 19:39:47'),(101,26,55,'fighter',2.10,'2026-01-31 19:39:47'),(102,27,56,'fighter',2.20,'2026-01-31 19:41:59'),(103,27,57,'fighter',2.30,'2026-01-31 19:41:59'),(104,28,58,'fighter',3.25,'2026-01-31 19:42:44'),(105,28,59,'fighter',1.36,'2026-01-31 19:42:44'),(106,29,60,'fighter',1.08,'2026-01-31 19:43:48'),(107,29,61,'fighter',8.00,'2026-01-31 19:43:48'),(108,30,62,'fighter',3.50,'2026-01-31 19:44:31'),(109,30,63,'fighter',1.30,'2026-01-31 19:44:31'),(110,31,64,'fighter',1.91,'2026-01-31 19:47:52'),(111,31,65,'fighter',1.91,'2026-01-31 19:47:52'),(112,32,66,'fighter',3.75,'2026-01-31 19:48:56'),(113,32,67,'fighter',1.28,'2026-01-31 19:48:56'),(114,33,68,'fighter',1.67,'2026-01-31 19:49:52'),(115,33,69,'fighter',2.25,'2026-01-31 19:49:52'),(116,34,70,'fighter',1.80,'2026-02-09 06:31:24'),(117,34,71,'fighter',1.80,'2026-02-09 06:31:24'),(118,35,72,'fighter',1.82,'2026-02-23 05:24:09'),(119,35,73,'fighter',2.08,'2026-02-23 05:24:09'),(120,36,74,'fighter',1.53,'2026-02-25 04:11:24'),(121,36,75,'fighter',2.08,'2026-02-25 04:11:24'),(122,37,76,'fighter',1.53,'2026-02-25 04:23:27'),(123,37,77,'fighter',2.08,'2026-02-25 04:23:27'),(124,38,78,'fighter',1.53,'2026-02-25 04:27:48'),(125,38,79,'fighter',2.08,'2026-02-25 04:27:48'),(126,39,80,'fighter',1.53,'2026-02-25 04:31:30'),(127,39,81,'fighter',2.08,'2026-02-25 04:31:30'),(128,40,82,'fighter',1.59,'2026-02-25 04:41:43'),(129,40,83,'fighter',2.09,'2026-02-25 04:41:43'),(130,41,84,'fighter',1.69,'2026-02-25 04:45:17'),(131,41,85,'fighter',2.19,'2026-02-25 04:45:17'),(132,42,86,'fighter',1.79,'2026-02-25 04:49:08'),(133,42,87,'fighter',2.29,'2026-02-25 04:49:08');
/*!40000 ALTER TABLE `betting_odds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bridge_fight_bonuses`
--

DROP TABLE IF EXISTS `bridge_fight_bonuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bridge_fight_bonuses` (
  `fight_bonus_id` int(11) NOT NULL AUTO_INCREMENT,
  `fight_id` int(11) NOT NULL,
  `fighter_id` int(11) NOT NULL,
  `bonus_id` int(11) NOT NULL,
  `awarded_date` date NOT NULL,
  PRIMARY KEY (`fight_bonus_id`),
  UNIQUE KEY `unique_fight_fighter_bonus` (`fight_id`,`fighter_id`,`bonus_id`),
  KEY `idx_fight_bonuses` (`fight_id`),
  KEY `idx_fighter_bonuses` (`fighter_id`),
  KEY `idx_bonus_type` (`bonus_id`),
  CONSTRAINT `bridge_fight_bonuses_ibfk_1` FOREIGN KEY (`fight_id`) REFERENCES `fact_fights` (`fight_id`) ON DELETE CASCADE,
  CONSTRAINT `bridge_fight_bonuses_ibfk_2` FOREIGN KEY (`fighter_id`) REFERENCES `dim_fighters` (`fighter_id`) ON DELETE CASCADE,
  CONSTRAINT `bridge_fight_bonuses_ibfk_3` FOREIGN KEY (`bonus_id`) REFERENCES `dim_bonuses` (`bonus_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bridge_fight_bonuses`
--

LOCK TABLES `bridge_fight_bonuses` WRITE;
/*!40000 ALTER TABLE `bridge_fight_bonuses` DISABLE KEYS */;
/*!40000 ALTER TABLE `bridge_fight_bonuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_bonus_types`
--

DROP TABLE IF EXISTS `dim_bonus_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_bonus_types` (
  `bonus_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `bonus_type_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`bonus_type_id`),
  UNIQUE KEY `bonus_type_name` (`bonus_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_bonus_types`
--

LOCK TABLES `dim_bonus_types` WRITE;
/*!40000 ALTER TABLE `dim_bonus_types` DISABLE KEYS */;
INSERT INTO `dim_bonus_types` VALUES (1,'Performance of the Night','Outstanding individual performance bonus'),(2,'Fight of the Night','Most exciting fight bonus (shared by both fighters)'),(3,'Knockout of the Night','Best knockout bonus (legacy bonus type)'),(4,'Submission of the Night','Best submission bonus (legacy bonus type)');
/*!40000 ALTER TABLE `dim_bonus_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_bonuses`
--

DROP TABLE IF EXISTS `dim_bonuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_bonuses` (
  `bonus_id` int(11) NOT NULL AUTO_INCREMENT,
  `bonus_type_id` int(11) NOT NULL,
  `bonus_amount` decimal(10,2) DEFAULT NULL,
  `event_id` int(11) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`bonus_id`),
  KEY `idx_bonus_type` (`bonus_type_id`),
  KEY `idx_event` (`event_id`),
  CONSTRAINT `dim_bonuses_ibfk_1` FOREIGN KEY (`bonus_type_id`) REFERENCES `dim_bonus_types` (`bonus_type_id`) ON DELETE CASCADE,
  CONSTRAINT `dim_bonuses_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `dim_events` (`event_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_bonuses`
--

LOCK TABLES `dim_bonuses` WRITE;
/*!40000 ALTER TABLE `dim_bonuses` DISABLE KEYS */;
/*!40000 ALTER TABLE `dim_bonuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_countries`
--

DROP TABLE IF EXISTS `dim_countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_countries` (
  `country_id` int(11) NOT NULL AUTO_INCREMENT,
  `country_name` varchar(100) NOT NULL,
  `country_code` varchar(3) NOT NULL,
  PRIMARY KEY (`country_id`),
  UNIQUE KEY `country_name` (`country_name`),
  UNIQUE KEY `country_code` (`country_code`),
  KEY `idx_country_code` (`country_code`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_countries`
--

LOCK TABLES `dim_countries` WRITE;
/*!40000 ALTER TABLE `dim_countries` DISABLE KEYS */;
INSERT INTO `dim_countries` VALUES (1,'United States','USA'),(2,'Brazil','BRA'),(3,'Russia','RUS'),(4,'Mexico','MEX'),(5,'Canada','CAN'),(6,'United Kingdom','GBR'),(7,'Ireland','IRL'),(8,'Australia','AUS'),(9,'Poland','POL'),(10,'Netherlands','NLD'),(11,'Sweden','SWE'),(12,'France','FRA'),(13,'Germany','DEU'),(14,'China','CHN'),(15,'Japan','JPN'),(16,'South Korea','KOR'),(17,'New Zealand','NZL'),(18,'Chile','CHL'),(19,'Argentina','ARG'),(20,'Venezuela','VEN'),(21,'Cuba','CUB'),(22,'Spain','ESP'),(23,'Italy','ITA'),(24,'Portugal','PRT'),(25,'Israel','ISR'),(26,'Nigeria','NGA'),(27,'Cameroon','CMR'),(28,'Kazakhstan','KAZ'),(29,'Thailand','THA'),(30,'Philippines','PHL'),(32,'Azerbaiyán','AZR'),(34,'Escocia','SCO'),(35,'Uzbekistán','UZB'),(36,'Myanmar','MMR'),(37,'Georgia','GEO'),(39,'Ecuador','ECU'),(40,'Lithuania','LIT'),(43,'República Dominicana','DOM'),(44,'Serbia','SER'),(45,'Mongolia','MON');
/*!40000 ALTER TABLE `dim_countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_event_types`
--

DROP TABLE IF EXISTS `dim_event_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_event_types` (
  `event_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_type_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`event_type_id`),
  UNIQUE KEY `event_type_name` (`event_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_event_types`
--

LOCK TABLES `dim_event_types` WRITE;
/*!40000 ALTER TABLE `dim_event_types` DISABLE KEYS */;
INSERT INTO `dim_event_types` VALUES (1,'PPV','Pay-Per-View numbered events'),(2,'Fight Night','UFC Fight Night events'),(3,'TUF Finale','The Ultimate Fighter season finales'),(4,'Special','Special events and international cards');
/*!40000 ALTER TABLE `dim_event_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_events`
--

DROP TABLE IF EXISTS `dim_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(200) NOT NULL,
  `event_date` date NOT NULL,
  `event_type_id` int(11) NOT NULL,
  `venue` varchar(200) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country_id` int(11) DEFAULT NULL,
  `attendance` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `winner_message` varchar(500) DEFAULT NULL,
  `winner_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_event_name` (`event_name`),
  KEY `idx_event_type` (`event_type_id`),
  KEY `idx_country` (`country_id`),
  CONSTRAINT `dim_events_ibfk_1` FOREIGN KEY (`event_type_id`) REFERENCES `dim_event_types` (`event_type_id`) ON DELETE CASCADE,
  CONSTRAINT `dim_events_ibfk_2` FOREIGN KEY (`country_id`) REFERENCES `dim_countries` (`country_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_events`
--

LOCK TABLES `dim_events` WRITE;
/*!40000 ALTER TABLE `dim_events` DISABLE KEYS */;
INSERT INTO `dim_events` VALUES (1,'UFC 324','2026-01-25',1,'T-Mobile Arena','Las Vegas','Nevada',1,NULL,'2026-01-14 05:27:13','ganador ufc 324',7),(5,'UFC 325','2026-01-31',1,'Qudos Bank Arena','Sydney','',8,NULL,'2026-01-31 19:23:04','ganador ufc 325',7),(6,'UFC 326','2026-03-07',1,'T-Mobile Arena','Las Vegas','Nevada',1,NULL,'2026-02-09 06:30:28',NULL,NULL);
/*!40000 ALTER TABLE `dim_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_fight_categories`
--

DROP TABLE IF EXISTS `dim_fight_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_fight_categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) NOT NULL,
  `category_code` varchar(20) NOT NULL,
  `display_order` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`),
  UNIQUE KEY `category_code` (`category_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_fight_categories`
--

LOCK TABLES `dim_fight_categories` WRITE;
/*!40000 ALTER TABLE `dim_fight_categories` DISABLE KEYS */;
INSERT INTO `dim_fight_categories` VALUES (1,'Preliminares','preliminary',1,'Peleas preliminares del evento','2026-01-14 22:25:45'),(2,'Cartelera Estelar','main_card',2,'Peleas de la cartelera principal','2026-01-14 22:25:45'),(3,'Pelea por el Título','title_fight',3,'Peleas por el campeonato','2026-01-14 22:25:45');
/*!40000 ALTER TABLE `dim_fight_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_fight_methods`
--

DROP TABLE IF EXISTS `dim_fight_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_fight_methods` (
  `method_id` int(11) NOT NULL AUTO_INCREMENT,
  `method_name` varchar(100) NOT NULL,
  `method_category` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`method_id`),
  UNIQUE KEY `method_name` (`method_name`),
  KEY `idx_method_category` (`method_category`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_fight_methods`
--

LOCK TABLES `dim_fight_methods` WRITE;
/*!40000 ALTER TABLE `dim_fight_methods` DISABLE KEYS */;
INSERT INTO `dim_fight_methods` VALUES (1,'KO/TKO','Knockout','Knockout or Technical Knockout'),(2,'Submission','Submission','Opponent tapped out or was rendered unconscious'),(3,'Decision - Unanimous','Decision','All judges scored for the same fighter'),(4,'Decision - Split','Decision','Judges split on the winner'),(5,'Decision - Majority','Decision','Two judges scored for the same fighter, one scored a draw'),(6,'DQ','Disqualification','Fighter disqualified for rule violations'),(7,'No Contest','No Contest','Fight ruled no contest due to accidental foul or other circumstances'),(8,'Draw - Unanimous','Draw','All judges scored the fight a draw'),(9,'Draw - Majority','Draw','Two judges scored a draw, one scored for a fighter'),(10,'Draw - Split','Draw','Each judge scored differently');
/*!40000 ALTER TABLE `dim_fight_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_fight_results`
--

DROP TABLE IF EXISTS `dim_fight_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_fight_results` (
  `fight_result_id` int(11) NOT NULL AUTO_INCREMENT,
  `result_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`fight_result_id`),
  UNIQUE KEY `result_name` (`result_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_fight_results`
--

LOCK TABLES `dim_fight_results` WRITE;
/*!40000 ALTER TABLE `dim_fight_results` DISABLE KEYS */;
INSERT INTO `dim_fight_results` VALUES (1,'Win','Fighter won the bout'),(2,'Loss','Fighter lost the bout'),(3,'Draw','Fight ended in a draw'),(4,'No Contest','Fight ruled no contest'),(5,'DQ','Fighter disqualified');
/*!40000 ALTER TABLE `dim_fight_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_fighters`
--

DROP TABLE IF EXISTS `dim_fighters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_fighters` (
  `fighter_id` int(11) NOT NULL AUTO_INCREMENT,
  `fighter_name` varchar(100) NOT NULL,
  `nickname` varchar(100) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `country_id` int(11) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `height_cm` decimal(5,2) DEFAULT NULL,
  `reach_cm` decimal(5,2) DEFAULT NULL,
  `stance_id` int(11) DEFAULT NULL,
  `total_wins` int(11) DEFAULT 0,
  `total_losses` int(11) DEFAULT 0,
  `total_draws` int(11) DEFAULT 0,
  `total_nc` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`fighter_id`),
  KEY `stance_id` (`stance_id`),
  KEY `idx_fighter_name` (`fighter_name`),
  KEY `idx_country` (`country_id`),
  CONSTRAINT `dim_fighters_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `dim_countries` (`country_id`) ON DELETE SET NULL,
  CONSTRAINT `dim_fighters_ibfk_2` FOREIGN KEY (`stance_id`) REFERENCES `dim_stances` (`stance_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_fighters`
--

LOCK TABLES `dim_fighters` WRITE;
/*!40000 ALTER TABLE `dim_fighters` DISABLE KEYS */;
INSERT INTO `dim_fighters` VALUES (1,'Alex Pereira','Poatan','alexpereira.jpg',2,'1987-07-07',1.93,2.03,1,13,3,0,0,'2026-01-14 05:26:01','2026-03-01 03:29:55'),(2,'Justin Gaethje','The Highlight','justingaethje.jpg',1,'1988-11-14',1.80,1.78,1,26,5,0,0,'2026-01-14 05:28:57','2026-01-21 03:08:30'),(3,'Paddy Pimblett','The Baddy','paddypimblett.jpg',6,'1995-01-03',1.78,1.85,1,23,3,0,0,'2026-01-14 05:30:46','2026-01-21 03:08:45'),(6,'Nazim Sadykhov','Black Wolf','nazimsadykhov.jpg',32,'1994-05-16',1.77,1.78,1,11,2,1,0,'2026-01-14 18:48:44','2026-01-21 01:49:19'),(7,'Farès Ziam','Smile Killer','faresziam.png',12,'1997-03-21',1.85,1.91,1,18,4,0,0,'2026-01-14 18:48:44','2026-01-21 01:52:35'),(12,'Maycee Barber','The Future','mayceebarber.jpg',6,'1998-05-18',1.65,1.65,3,14,2,0,0,'2026-01-14 19:00:27','2026-01-21 02:07:51'),(13,'Karine Silva','Killer','karinesilva.jpg',2,'1993-12-02',1.65,1.70,1,19,5,0,0,'2026-01-14 19:00:27','2026-01-21 02:23:19'),(14,'Terrance McKinney','T. Wrecks','terrancemckinney.jpg',1,'1994-09-15',1.78,1.87,1,17,7,0,0,'2026-01-14 19:00:27','2026-01-21 02:25:29'),(15,'Chris Duncan','The Problem','chrisduncan.jpg',34,'1993-05-10',1.78,1.82,1,14,2,0,0,'2026-01-14 19:00:27','2026-01-21 02:27:11'),(24,'Grant Dawson','KGD','grantdawson.jpg',1,'1994-02-20',1.78,1.83,1,23,2,0,0,'2026-01-14 19:19:50','2026-01-21 02:28:29'),(25,'Manuel Torres','El Loco','manueltorres.jpg',4,'1997-03-21',1.78,1.87,1,16,3,0,0,'2026-01-14 19:19:50','2026-01-21 02:30:07'),(26,'Jan Błachowicz','','janblachowicz.jpg',9,'1983-02-24',1.88,1.98,1,29,11,1,0,'2026-01-14 19:19:50','2026-01-21 02:33:53'),(27,'Bogdan Guskov','','bogdanguskov.jpg',35,'1992-09-12',1.90,1.93,1,18,3,0,0,'2026-01-14 19:19:50','2026-01-21 02:36:04'),(28,'Henry Cejudo','Triple C','henrycejudo.jpg',1,'1987-02-09',1.63,1.71,1,16,5,0,0,'2026-01-14 19:28:12','2026-01-21 02:38:12'),(29,'Payton Talbott',NULL,'paytontalbott.jpg',1,'1998-09-09',1.78,1.78,1,1,1,0,0,'2026-01-14 19:28:12','2026-01-21 02:40:12'),(30,'Brandon Moreno','The Assassin Baby','brandonmoreno.jpg',4,'1993-12-07',1.70,1.78,1,23,8,0,0,'2026-01-14 19:28:12','2026-01-21 02:43:22'),(31,'Tatsuro Taira','The Best','tatsurotaira.jpg',15,'2000-01-27',1.70,1.78,1,18,1,0,0,'2026-01-14 19:28:12','2026-01-21 02:43:38'),(32,'Alexandre Pantoja','The Cannibal','alexandrepantoja.jpg',2,'1990-04-16',1.66,1.73,1,30,6,0,0,'2026-01-14 19:28:12','2026-01-21 02:45:19'),(33,'Joshua Van','The Fearless','joshuavan.jpg',36,'2001-10-10',1.65,1.65,1,16,2,0,0,'2026-01-14 19:28:12','2026-01-21 02:47:16'),(34,'Merab Dvalishvili','The Machine','merabdvalishvili.jpg',37,'1991-01-10',1.68,1.73,1,21,5,0,0,'2026-01-14 19:30:05','2026-01-21 02:49:34'),(35,'Petr Yan','No Mercy','petryan.jpg',3,'1993-02-11',1.71,1.71,1,20,5,0,0,'2026-01-14 19:30:05','2026-01-21 02:49:48'),(36,'Nikita Krylov','The Miner','nikitakrylov.jpg',3,'1992-07-03',1.91,1.97,1,30,11,0,0,'2026-01-16 16:13:45','2026-01-21 02:52:07'),(37,'Modestas Bukauskas','The Baltic Gladiator','modestasbukauskas.jpg',40,'1994-02-10',1.91,1.93,1,19,6,0,0,'2026-01-16 16:14:49','2026-01-21 02:54:07'),(38,'Ateba Gautier','The Silent Assassin','atebagautier.jpg',27,'2002-04-10',1.93,2.06,1,9,1,0,0,'2026-01-16 16:18:51','2026-01-21 02:57:03'),(39,'Andrey Pulyaev','','andreypulyaev.jpg',3,'1997-09-10',1.93,1.99,1,10,3,0,0,'2026-01-16 16:19:37','2026-01-21 02:57:19'),(40,'Umar Nurmagomedov','','umarnurmagomedov.jpg',3,'1996-01-03',1.72,1.75,1,19,1,0,0,'2026-01-16 16:20:58','2026-01-21 03:09:32'),(41,'Deiveson Figueiredo','Deus da Guerra','deivesonfigueiredo.jpg',2,'1987-12-18',1.65,1.73,1,25,5,1,0,'2026-01-16 16:21:46','2026-01-21 03:09:51'),(42,'Arnold Allen','Almighty','arnoldallen.jpg',6,'1994-01-22',1.73,1.78,1,20,3,0,0,'2026-01-16 16:23:16','2026-01-21 03:10:03'),(43,'Jean Silva','Lord','jeansilva.jpg',2,'1996-12-13',1.70,1.75,1,16,3,0,0,'2026-01-16 16:23:58','2026-01-21 03:10:20'),(44,'Natalia Silva','','nataliasilva.jpg',2,'1997-02-03',1.63,1.65,1,19,5,1,0,'2026-01-16 16:25:26','2026-01-21 03:10:34'),(45,'Rose Namajunas','Thug','rosenamajunas.jpg',1,'1992-06-29',1.65,1.65,1,15,7,0,0,'2026-01-16 16:26:08','2026-01-21 03:10:48'),(46,'Waldo Cortes Acosta','Salsa Boy','waldocortes.jpg',43,'1991-10-03',1.93,1.98,1,16,2,0,0,'2026-01-16 16:26:58','2026-01-21 03:10:59'),(47,'Derrick Lewis','The Black Beast','derricklewis.jpg',1,'1995-02-07',1.91,2.01,1,29,12,0,0,'2026-01-16 16:28:47','2026-01-21 03:11:11'),(48,'Sean O\'Malley','Sugar','seanomalley.jpg',1,'1994-10-24',1.80,1.83,1,18,3,0,0,'2026-01-16 16:29:26','2026-01-21 03:11:22'),(49,'Song Yadong','Kung Fu Kid','songyadong.jpg',14,'1997-12-02',1.73,1.73,1,22,8,1,0,'2026-01-16 16:30:12','2026-01-21 03:11:32'),(50,'Alex Perez','The Decision','alexperez.png',1,'1992-03-21',1.68,1.68,1,0,0,0,0,'2026-01-24 05:22:05','2026-02-09 03:20:17'),(51,'Charles Johnson','InnerG','charlesjohnson.png',1,'1991-01-10',1.75,1.78,1,0,0,0,0,'2026-01-24 05:23:37','2026-02-09 03:20:34'),(52,'Jonathan Micallef','The Captain','jonathanmicallef.png',8,'1999-03-05',1.83,1.96,1,0,0,0,0,'2026-01-31 19:24:44','2026-02-09 03:43:00'),(53,'Oban Elliott','The Welsh Gangster','obanelliott.png',6,'1997-12-19',1.83,1.83,1,0,0,0,0,'2026-01-31 19:25:44','2026-02-09 03:43:00'),(54,' Jacob Malkoun','Mamba','jacobmalkoun.png',8,'1995-08-26',1.75,1.85,1,0,0,0,0,'2026-01-31 19:26:33','2026-02-09 03:43:50'),(55,'Torrez Finney','THE PUNISHER','torrezfinney.png',1,'1998-10-24',1.73,1.92,1,0,0,0,0,'2026-01-31 19:27:07','2026-02-09 03:43:00'),(56,'Cam Rowston','Batlle Girafe','camrowston.png',8,'1995-01-19',1.91,1.91,1,0,0,0,0,'2026-01-31 19:28:24','2026-02-09 03:43:00'),(57,'Cody Brundage','','codybrundage.png',1,'1994-05-16',1.83,1.83,1,0,0,0,0,'2026-01-31 19:28:50','2026-02-09 03:43:00'),(58,'Junior Tafa','The Juggernaut','juniortafa.png',8,'1996-09-21',1.91,1.91,1,0,0,0,0,'2026-01-31 19:30:02','2026-02-09 03:43:00'),(59,'Billy Elekana','Son Of Susie','billyelekana.png',1,'1995-05-28',1.91,1.96,1,0,0,0,0,'2026-01-31 19:30:36','2026-02-09 03:43:00'),(60,'Quillan Salkilld','','quillansalkilld.png',8,'1999-12-28',1.83,1.91,1,0,0,0,0,'2026-01-31 19:31:12','2026-02-09 03:43:00'),(61,'Jamie Mullarkey','','jaimemullarkey.png',8,'1994-08-17',1.83,1.88,1,0,0,0,0,'2026-01-31 19:31:36','2026-02-09 03:43:00'),(62,'Tai Tuivasa','Bam Bam','taituivasa.png',8,'1993-03-16',1.88,1.91,1,0,0,0,0,'2026-01-31 19:32:12','2026-02-09 03:43:00'),(63,'Tallison Teixeira','xicão','tallisontexeira.png',2,'1999-12-07',2.01,2.11,1,0,0,0,0,'2026-01-31 19:33:13','2026-02-09 03:43:00'),(64,'Rafael Fiziev','Ataman','rafaelfiziev.png',32,'1993-03-05',1.73,1.82,1,0,0,0,0,'2026-01-31 19:33:51','2026-02-09 03:43:00'),(65,'Mauricio Ruffy','One Shot','mauricioruffy.png',2,'1993-06-17',1.80,1.91,1,0,0,0,0,'2026-01-31 19:34:25','2026-02-09 03:43:00'),(66,'Dan Hooker','The Hangman','danhooker.png',17,'1990-02-13',1.83,1.92,1,0,0,0,0,'2026-01-31 19:35:03','2026-02-09 03:43:00'),(67,'Benoît Saint Denis','God of War','benoitsaintdenis.png',12,'1995-12-18',1.80,1.85,1,0,0,0,0,'2026-01-31 19:35:44','2026-02-09 03:43:00'),(68,'Alexander Volkanovski','The Great','alexandervolkanovski.png',8,'1988-09-29',1.68,1.82,1,0,0,0,0,'2026-01-31 19:36:41','2026-02-09 03:43:00'),(69,'Diego Lopes','','diegolopes.png',2,'1994-12-30',1.80,1.84,1,0,0,0,0,'2026-01-31 19:37:08','2026-02-09 03:43:00'),(70,'Max Holloway','Blessed','maxholloway.png',1,'1991-12-04',1.80,1.75,1,0,0,0,0,'2026-02-09 06:28:41','2026-03-01 03:33:43'),(71,'Charles Oliveira','do Bronx','charlesoliveira.png',2,'1989-10-17',1.78,1.88,1,0,0,0,0,'2026-02-09 06:29:32','2026-03-01 03:29:55'),(72,'Caio Borralho','The Natural','caioborralho.png',2,'1993-01-16',1.87,1.91,1,0,0,0,0,'2026-02-23 05:22:16','2026-03-01 03:29:55'),(73,'Reinier de Ridder','The Dutch Knight','reinierderidder.png',10,'1990-09-07',1.93,1.98,1,0,0,0,0,'2026-02-23 05:23:12','2026-03-01 03:29:55'),(74,'Rob Font','','robfont.png',1,'1987-06-25',1.73,1.82,1,0,0,0,0,'2026-02-25 04:08:33','2026-03-01 03:29:55'),(75,'Raul Rosas Jr.','El Niño Problema','raulrosasjr.png',4,'2004-10-08',1.75,1.75,1,0,0,0,0,'2026-02-25 04:09:38','2026-03-01 03:29:55'),(76,'Drew Dober','','drewdober.png',1,'1988-10-19',1.73,1.78,1,0,0,0,0,'2026-02-25 04:21:35','2026-03-01 03:29:55'),(77,'Michael Johnson','The Menace','michaeljohnson.png',1,'1986-06-04',1.78,1.87,1,0,0,0,0,'2026-02-25 04:22:41','2026-03-01 03:29:55'),(78,'Gregory Rodrigues','Robocop','gregoryrodrigues.png',2,'1992-02-17',1.91,1.91,1,0,0,0,0,'2026-02-25 04:25:27','2026-03-01 03:29:55'),(79,'Brunno Ferreira','The Hulk','brunnoferreira.png',2,'1992-11-04',1.79,1.83,1,0,0,0,0,'2026-02-25 04:27:00','2026-03-01 03:29:55'),(80,'Cody Garbrandt','No Love','codygarbrandt.png',1,'1991-07-07',1.73,1.73,1,0,0,0,0,'2026-02-25 04:30:03','2026-03-01 03:29:55'),(81,'Long Xiao','No Love','xiaolong.png',14,'1998-04-13',1.72,1.78,1,0,0,0,0,'2026-02-25 04:30:43','2026-03-01 03:29:55'),(82,'Donte Johnson','Lock Jaw','dontejohnson.png',1,'1999-01-25',1.73,1.88,1,0,0,0,0,'2026-02-25 04:33:20','2026-03-01 03:29:55'),(83,'Duško Todorović','Thunder','duskotodorovic.png',44,'1994-05-19',1.85,1.88,1,0,0,0,0,'2026-02-25 04:37:15','2026-03-01 03:29:55'),(84,'Ricky Turcios','Thunder','rickyturcios.png',1,'1993-06-05',1.75,1.80,1,0,0,0,0,'2026-02-25 04:42:54','2026-03-01 03:29:55'),(85,'Alberto Montes','The Promise','albertomontes.png',20,'1994-05-31',1.70,1.75,1,0,0,0,0,'2026-02-25 04:43:51','2026-03-01 03:29:55'),(86,'Cody Durden','Custom Made','codydurden.png',1,'1991-03-29',1.70,1.70,1,0,0,0,0,'2026-02-25 04:46:26','2026-03-01 03:29:55'),(87,'Nyamjargal Tumendemberel','Art of Knockout','nyamjargaltumendemberel.png',45,'1998-03-22',1.70,1.80,1,0,0,0,0,'2026-02-25 04:48:11','2026-03-01 03:29:55');
/*!40000 ALTER TABLE `dim_fighters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_genders`
--

DROP TABLE IF EXISTS `dim_genders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_genders` (
  `gender_id` int(11) NOT NULL AUTO_INCREMENT,
  `gender_name` varchar(20) NOT NULL,
  PRIMARY KEY (`gender_id`),
  UNIQUE KEY `gender_name` (`gender_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_genders`
--

LOCK TABLES `dim_genders` WRITE;
/*!40000 ALTER TABLE `dim_genders` DISABLE KEYS */;
INSERT INTO `dim_genders` VALUES (2,'Female'),(1,'Male');
/*!40000 ALTER TABLE `dim_genders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_rankings`
--

DROP TABLE IF EXISTS `dim_rankings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_rankings` (
  `ranking_id` int(11) NOT NULL AUTO_INCREMENT,
  `fighter_id` int(11) NOT NULL,
  `weight_class_id` int(11) NOT NULL,
  `rank_position` int(11) DEFAULT NULL,
  `is_champion` tinyint(1) DEFAULT 0,
  `effective_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ranking_id`),
  KEY `idx_fighter_ranking` (`fighter_id`,`effective_date`),
  KEY `idx_weight_class_ranking` (`weight_class_id`,`rank_position`,`effective_date`),
  CONSTRAINT `dim_rankings_ibfk_1` FOREIGN KEY (`fighter_id`) REFERENCES `dim_fighters` (`fighter_id`) ON DELETE CASCADE,
  CONSTRAINT `dim_rankings_ibfk_2` FOREIGN KEY (`weight_class_id`) REFERENCES `dim_weight_classes` (`weight_class_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_rankings`
--

LOCK TABLES `dim_rankings` WRITE;
/*!40000 ALTER TABLE `dim_rankings` DISABLE KEYS */;
/*!40000 ALTER TABLE `dim_rankings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_referees`
--

DROP TABLE IF EXISTS `dim_referees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_referees` (
  `referee_id` int(11) NOT NULL AUTO_INCREMENT,
  `referee_name` varchar(100) NOT NULL,
  `country_id` int(11) DEFAULT NULL,
  `total_fights_refereed` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`referee_id`),
  KEY `idx_referee_name` (`referee_name`),
  KEY `idx_country` (`country_id`),
  CONSTRAINT `dim_referees_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `dim_countries` (`country_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_referees`
--

LOCK TABLES `dim_referees` WRITE;
/*!40000 ALTER TABLE `dim_referees` DISABLE KEYS */;
/*!40000 ALTER TABLE `dim_referees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_stances`
--

DROP TABLE IF EXISTS `dim_stances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_stances` (
  `stance_id` int(11) NOT NULL AUTO_INCREMENT,
  `stance_name` varchar(50) NOT NULL,
  PRIMARY KEY (`stance_id`),
  UNIQUE KEY `stance_name` (`stance_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_stances`
--

LOCK TABLES `dim_stances` WRITE;
/*!40000 ALTER TABLE `dim_stances` DISABLE KEYS */;
INSERT INTO `dim_stances` VALUES (1,'Orthodox'),(2,'Southpaw'),(3,'Switch');
/*!40000 ALTER TABLE `dim_stances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_time`
--

DROP TABLE IF EXISTS `dim_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_time` (
  `time_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_date` date NOT NULL,
  `day_of_week` varchar(10) DEFAULT NULL,
  `day_of_month` int(11) DEFAULT NULL,
  `month` int(11) DEFAULT NULL,
  `month_name` varchar(10) DEFAULT NULL,
  `quarter` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `is_weekend` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`time_id`),
  UNIQUE KEY `full_date` (`full_date`),
  KEY `idx_full_date` (`full_date`),
  KEY `idx_year_month` (`year`,`month`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_time`
--

LOCK TABLES `dim_time` WRITE;
/*!40000 ALTER TABLE `dim_time` DISABLE KEYS */;
INSERT INTO `dim_time` VALUES (1,'2026-01-24','Saturday',24,1,'January',1,2026,1),(2,'2026-02-15','Sunday',15,2,'February',1,2026,1),(4,'2026-01-25','Sunday',25,1,'January',1,2026,1),(5,'2026-01-31','Saturday',31,1,'January',1,2026,1),(6,'2026-03-07','Saturday',7,3,'March',1,2026,1);
/*!40000 ALTER TABLE `dim_time` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_weight_classes`
--

DROP TABLE IF EXISTS `dim_weight_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_weight_classes` (
  `weight_class_id` int(11) NOT NULL AUTO_INCREMENT,
  `class_name` varchar(50) NOT NULL,
  `gender_id` int(11) NOT NULL,
  `weight_limit_lbs` decimal(5,2) NOT NULL,
  `weight_limit_kg` decimal(5,2) NOT NULL,
  `display_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`weight_class_id`),
  UNIQUE KEY `class_name` (`class_name`),
  KEY `idx_class_name` (`class_name`),
  KEY `idx_gender` (`gender_id`),
  CONSTRAINT `dim_weight_classes_ibfk_1` FOREIGN KEY (`gender_id`) REFERENCES `dim_genders` (`gender_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_weight_classes`
--

LOCK TABLES `dim_weight_classes` WRITE;
/*!40000 ALTER TABLE `dim_weight_classes` DISABLE KEYS */;
INSERT INTO `dim_weight_classes` VALUES (1,'Flyweight',1,125.00,56.70,1),(2,'Bantamweight',1,135.00,61.20,2),(3,'Featherweight',1,145.00,65.80,3),(4,'Lightweight',1,155.00,70.30,4),(5,'Welterweight',1,170.00,77.10,5),(6,'Middleweight',1,185.00,83.90,6),(7,'Light Heavyweight',1,205.00,93.00,7),(8,'Heavyweight',1,265.00,120.20,8),(13,'Strawweight',2,115.00,52.20,9);
/*!40000 ALTER TABLE `dim_weight_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_fights`
--

DROP TABLE IF EXISTS `fact_fights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_fights` (
  `fight_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `time_id` int(11) NOT NULL,
  `weight_class_id` int(11) NOT NULL,
  `fight_category_id` int(11) DEFAULT NULL,
  `card_position` int(11) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `referee_id` int(11) DEFAULT NULL,
  `fighter_red_id` int(11) NOT NULL,
  `fighter_blue_id` int(11) NOT NULL,
  `winner_id` int(11) DEFAULT NULL,
  `result_type_code` varchar(20) DEFAULT NULL,
  `fight_result_id` int(11) NOT NULL,
  `method_id` int(11) NOT NULL,
  `method_detail` varchar(100) DEFAULT NULL,
  `scheduled_rounds` int(11) NOT NULL,
  `final_round` int(11) NOT NULL,
  `final_time_seconds` int(11) NOT NULL,
  `total_fight_time_seconds` int(11) NOT NULL,
  `red_significant_strikes_landed` int(11) DEFAULT 0,
  `red_significant_strikes_attempted` int(11) DEFAULT 0,
  `red_total_strikes_landed` int(11) DEFAULT 0,
  `red_total_strikes_attempted` int(11) DEFAULT 0,
  `red_takedowns_landed` int(11) DEFAULT 0,
  `red_takedowns_attempted` int(11) DEFAULT 0,
  `red_submission_attempts` int(11) DEFAULT 0,
  `red_knockdowns` int(11) DEFAULT 0,
  `red_control_time_seconds` int(11) DEFAULT 0,
  `blue_significant_strikes_landed` int(11) DEFAULT 0,
  `blue_significant_strikes_attempted` int(11) DEFAULT 0,
  `blue_total_strikes_landed` int(11) DEFAULT 0,
  `blue_total_strikes_attempted` int(11) DEFAULT 0,
  `blue_takedowns_landed` int(11) DEFAULT 0,
  `blue_takedowns_attempted` int(11) DEFAULT 0,
  `blue_submission_attempts` int(11) DEFAULT 0,
  `blue_knockdowns` int(11) DEFAULT 0,
  `blue_control_time_seconds` int(11) DEFAULT 0,
  `is_title_fight` tinyint(1) DEFAULT 0,
  `is_main_event` tinyint(1) DEFAULT 0,
  `is_co_main_event` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`fight_id`),
  KEY `referee_id` (`referee_id`),
  KEY `idx_event_fights` (`event_id`),
  KEY `idx_fighter_red_fights` (`fighter_red_id`),
  KEY `idx_fighter_blue_fights` (`fighter_blue_id`),
  KEY `idx_weight_class_fights` (`weight_class_id`),
  KEY `idx_fight_date` (`time_id`),
  KEY `idx_title_fights` (`is_title_fight`),
  KEY `idx_method` (`method_id`),
  KEY `idx_fight_result` (`fight_result_id`),
  KEY `idx_winner` (`winner_id`),
  KEY `idx_fight_category` (`fight_category_id`),
  KEY `idx_result_type_code` (`result_type_code`),
  KEY `idx_display_order` (`event_id`,`display_order`),
  CONSTRAINT `fact_fights_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `dim_events` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `fact_fights_ibfk_2` FOREIGN KEY (`time_id`) REFERENCES `dim_time` (`time_id`) ON DELETE CASCADE,
  CONSTRAINT `fact_fights_ibfk_3` FOREIGN KEY (`weight_class_id`) REFERENCES `dim_weight_classes` (`weight_class_id`) ON DELETE CASCADE,
  CONSTRAINT `fact_fights_ibfk_4` FOREIGN KEY (`referee_id`) REFERENCES `dim_referees` (`referee_id`) ON DELETE SET NULL,
  CONSTRAINT `fact_fights_ibfk_5` FOREIGN KEY (`fighter_red_id`) REFERENCES `dim_fighters` (`fighter_id`) ON DELETE CASCADE,
  CONSTRAINT `fact_fights_ibfk_6` FOREIGN KEY (`fighter_blue_id`) REFERENCES `dim_fighters` (`fighter_id`) ON DELETE CASCADE,
  CONSTRAINT `fact_fights_ibfk_7` FOREIGN KEY (`winner_id`) REFERENCES `dim_fighters` (`fighter_id`) ON DELETE SET NULL,
  CONSTRAINT `fact_fights_ibfk_8` FOREIGN KEY (`fight_result_id`) REFERENCES `dim_fight_results` (`fight_result_id`) ON DELETE CASCADE,
  CONSTRAINT `fact_fights_ibfk_9` FOREIGN KEY (`method_id`) REFERENCES `dim_fight_methods` (`method_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fight_category` FOREIGN KEY (`fight_category_id`) REFERENCES `dim_fight_categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_fights`
--

LOCK TABLES `fact_fights` WRITE;
/*!40000 ALTER TABLE `fact_fights` DISABLE KEYS */;
INSERT INTO `fact_fights` VALUES (1,1,1,4,3,5,5,NULL,2,3,2,'fighter_win',1,5,NULL,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,'2026-01-14 05:33:44'),(17,1,1,7,1,1,2,NULL,36,37,36,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-16 16:36:13'),(18,1,1,6,1,1,3,NULL,38,39,38,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-16 16:36:53'),(19,1,1,2,1,3,4,NULL,40,41,40,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-16 16:37:16'),(20,1,1,3,2,1,1,NULL,42,43,43,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-16 16:38:18'),(21,1,1,13,2,2,2,NULL,44,45,44,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-16 16:38:47'),(22,1,1,8,2,3,3,NULL,46,47,46,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-16 16:39:08'),(23,1,1,2,2,4,4,NULL,48,49,48,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-16 16:39:32'),(24,1,4,1,1,1,1,NULL,50,51,50,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-24 05:25:21'),(25,5,5,5,1,0,1,NULL,52,53,52,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-31 19:38:54'),(26,5,5,6,1,0,2,NULL,54,55,54,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-31 19:39:47'),(27,5,5,6,1,0,3,NULL,56,57,56,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-31 19:41:59'),(28,5,5,7,1,0,4,NULL,58,59,59,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-31 19:42:44'),(29,5,5,4,2,0,1,NULL,60,61,60,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-31 19:43:48'),(30,5,5,8,2,0,2,NULL,62,63,63,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-31 19:44:31'),(31,5,5,4,2,0,3,NULL,64,65,65,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-31 19:47:09'),(32,5,5,4,2,0,4,NULL,66,67,67,'fighter_win',1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-01-31 19:48:56'),(33,5,5,3,3,0,5,NULL,68,69,68,'fighter_win',1,5,NULL,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,'2026-01-31 19:49:52'),(34,6,6,4,3,0,1,NULL,70,71,NULL,NULL,1,5,NULL,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,'2026-02-09 06:31:24'),(35,6,6,6,2,0,2,NULL,72,73,NULL,NULL,1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-02-23 05:24:09'),(36,6,6,2,2,0,3,NULL,74,75,NULL,NULL,1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-02-25 04:11:24'),(37,6,6,4,2,0,4,NULL,76,77,NULL,NULL,1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-02-25 04:23:27'),(38,6,6,6,2,0,5,NULL,78,79,NULL,NULL,1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-02-25 04:27:48'),(39,6,6,2,1,0,6,NULL,80,81,NULL,NULL,1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-02-25 04:31:30'),(40,6,6,6,1,0,7,NULL,82,83,NULL,NULL,1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-02-25 04:41:43'),(41,6,6,3,1,0,8,NULL,84,85,NULL,NULL,1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-02-25 04:45:17'),(42,6,6,1,1,0,9,NULL,86,87,NULL,NULL,1,5,NULL,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2026-02-25 04:49:08');
/*!40000 ALTER TABLE `fact_fights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitation_tokens`
--

DROP TABLE IF EXISTS `invitation_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitation_tokens` (
  `token_id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(64) NOT NULL,
  `email` varchar(255) DEFAULT NULL COMMENT 'Email opcional para vincular token a usuario específico',
  `created_by` int(11) NOT NULL COMMENT 'Admin que generó la invitación',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'Fecha de expiración (default 7 días)',
  `used_at` timestamp NULL DEFAULT NULL COMMENT 'Cuándo se usó el token',
  `used_by` int(11) DEFAULT NULL COMMENT 'Usuario que usó el token',
  `revoked_at` timestamp NULL DEFAULT NULL COMMENT 'Cuándo se revocó (si aplica)',
  `revoked_by` int(11) DEFAULT NULL COMMENT 'Admin que revocó el token',
  `notes` text DEFAULT NULL COMMENT 'Notas sobre la invitación',
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `token` (`token`),
  KEY `used_by` (`used_by`),
  KEY `revoked_by` (`revoked_by`),
  KEY `idx_token` (`token`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_used_at` (`used_at`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `invitation_tokens_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `invitation_tokens_ibfk_2` FOREIGN KEY (`used_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `invitation_tokens_ibfk_3` FOREIGN KEY (`revoked_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tokens de invitación para registro de nuevos usuarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitation_tokens`
--

LOCK TABLES `invitation_tokens` WRITE;
/*!40000 ALTER TABLE `invitation_tokens` DISABLE KEYS */;
INSERT INTO `invitation_tokens` VALUES (1,'a0b551765181a4f3679e5a24aec386a3b2159130af3a2480a35805b990aa2ba7',NULL,1,'2026-01-21 03:34:46','2026-01-28 03:34:46',NULL,NULL,'2026-01-21 03:37:03',1,NULL),(2,'6d06f708c20443ee1b87ee46d5f551768c7f0db0dfa9167b03b2d797aee02b75','marco.puga@gmail.com',1,'2026-01-21 03:34:50','2026-01-28 03:34:50',NULL,NULL,'2026-01-21 03:37:01',1,NULL),(3,'f791586ef2181feb9ddfb6c7159fab97ede85c12a39b0232e0ae364394905125',NULL,1,'2026-01-21 03:37:23','2026-01-28 03:37:23','2026-01-21 03:37:52',NULL,NULL,NULL,NULL),(4,'11c5cd699d6003a5d39e20b9208870071e470f954c9f97dd50cdcdf250807da0',NULL,1,'2026-01-21 04:02:43','2026-01-22 04:02:43','2026-01-21 04:03:43',NULL,NULL,NULL,NULL),(5,'8f0fa67433247f5618f1f811cf2ba256e686da7a64ae8c329ca22bb65fcb385b',NULL,1,'2026-01-21 04:05:01','2026-01-28 04:05:01','2026-01-21 04:05:29',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `invitation_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `predictions`
--

DROP TABLE IF EXISTS `predictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `predictions` (
  `prediction_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `fight_id` int(11) NOT NULL,
  `predicted_winner_id` int(11) NOT NULL,
  `predicted_method_id` int(11) DEFAULT NULL,
  `predicted_round` int(11) DEFAULT NULL,
  `points_earned` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`prediction_id`),
  UNIQUE KEY `unique_user_fight` (`user_id`,`fight_id`),
  KEY `fight_id` (`fight_id`),
  CONSTRAINT `predictions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `predictions_ibfk_2` FOREIGN KEY (`fight_id`) REFERENCES `fact_fights` (`fight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `predictions`
--

LOCK TABLES `predictions` WRITE;
/*!40000 ALTER TABLE `predictions` DISABLE KEYS */;
/*!40000 ALTER TABLE `predictions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration_tokens`
--

DROP TABLE IF EXISTS `registration_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration_tokens` (
  `token_id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(64) NOT NULL,
  `created_by` int(11) NOT NULL,
  `used_by` int(11) DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `token` (`token`),
  KEY `created_by` (`created_by`),
  KEY `used_by` (`used_by`),
  KEY `idx_token` (`token`),
  KEY `idx_is_used` (`is_used`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `registration_tokens_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `registration_tokens_ibfk_2` FOREIGN KEY (`used_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration_tokens`
--

LOCK TABLES `registration_tokens` WRITE;
/*!40000 ALTER TABLE `registration_tokens` DISABLE KEYS */;
INSERT INTO `registration_tokens` VALUES (2,'4f2721b752c9831a2fd7b9b89be405e911eee1de261d0b6962240bb77fd5e256',1,15,1,'2026-03-05 01:14:12','2026-03-05 01:14:12','2026-03-05 01:13:42');
/*!40000 ALTER TABLE `registration_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_bets`
--

DROP TABLE IF EXISTS `user_bets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_bets` (
  `bet_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `fight_id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `predicted_winner_id` int(11) DEFAULT NULL,
  `bet_type` enum('fighter_win','draw','no_contest') DEFAULT 'fighter_win',
  `bet_amount` decimal(10,2) DEFAULT 100.00,
  `potential_return` decimal(10,2) DEFAULT NULL,
  `odds_value` decimal(5,2) DEFAULT NULL,
  `status` enum('pending','won','lost','cancelled') DEFAULT 'pending',
  `result_points` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`bet_id`),
  UNIQUE KEY `unique_user_fight_bet` (`user_id`,`fight_id`),
  KEY `predicted_winner_id` (`predicted_winner_id`),
  KEY `idx_user_bets` (`user_id`),
  KEY `idx_fight_bets` (`fight_id`),
  KEY `idx_status` (`status`),
  KEY `idx_user_bets_event_id` (`event_id`),
  CONSTRAINT `fk_user_bets_event` FOREIGN KEY (`event_id`) REFERENCES `dim_events` (`event_id`),
  CONSTRAINT `user_bets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_bets_ibfk_2` FOREIGN KEY (`fight_id`) REFERENCES `fact_fights` (`fight_id`) ON DELETE CASCADE,
  CONSTRAINT `user_bets_ibfk_3` FOREIGN KEY (`predicted_winner_id`) REFERENCES `dim_fighters` (`fighter_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=437 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_bets`
--

LOCK TABLES `user_bets` WRITE;
/*!40000 ALTER TABLE `user_bets` DISABLE KEYS */;
INSERT INTO `user_bets` VALUES (338,7,1,1,2,'fighter_win',100.00,290.00,2.90,'won',0,'2026-02-09 03:21:36'),(339,7,17,1,36,'fighter_win',100.00,225.00,2.25,'won',0,'2026-02-09 03:21:36'),(340,7,18,1,38,'fighter_win',100.00,110.00,1.10,'won',0,'2026-02-09 03:21:36'),(341,7,19,1,40,'fighter_win',100.00,106.00,1.06,'won',0,'2026-02-09 03:21:36'),(342,7,20,1,43,'fighter_win',100.00,140.00,1.40,'won',0,'2026-02-09 03:21:36'),(343,7,21,1,44,'fighter_win',100.00,128.00,1.28,'won',0,'2026-02-09 03:21:36'),(344,7,22,1,46,'fighter_win',100.00,130.00,1.30,'won',0,'2026-02-09 03:21:36'),(345,7,23,1,48,'fighter_win',100.00,148.00,1.48,'won',0,'2026-02-09 03:21:36'),(346,7,24,1,50,'fighter_win',100.00,250.00,2.50,'won',0,'2026-02-09 03:21:36'),(347,13,1,1,3,'fighter_win',100.00,142.00,1.42,'lost',0,'2026-02-09 03:22:34'),(348,13,17,1,37,'fighter_win',100.00,167.00,1.67,'lost',0,'2026-02-09 03:22:34'),(349,13,18,1,39,'fighter_win',100.00,725.00,7.25,'lost',0,'2026-02-09 03:22:34'),(350,13,19,1,41,'fighter_win',100.00,950.00,9.50,'lost',0,'2026-02-09 03:22:34'),(351,13,20,1,42,'fighter_win',100.00,300.00,3.00,'lost',0,'2026-02-09 03:22:34'),(352,13,21,1,45,'fighter_win',100.00,375.00,3.75,'lost',0,'2026-02-09 03:22:34'),(353,13,22,1,47,'fighter_win',100.00,360.00,3.60,'lost',0,'2026-02-09 03:22:34'),(354,13,23,1,49,'fighter_win',100.00,270.00,2.70,'lost',0,'2026-02-09 03:22:34'),(355,13,24,1,51,'fighter_win',100.00,157.00,1.57,'lost',0,'2026-02-09 03:22:34'),(356,8,1,1,3,'fighter_win',100.00,142.00,1.42,'lost',0,'2026-02-09 03:23:09'),(357,8,17,1,37,'fighter_win',100.00,167.00,1.67,'lost',0,'2026-02-09 03:23:09'),(358,8,18,1,39,'fighter_win',100.00,725.00,7.25,'lost',0,'2026-02-09 03:23:09'),(359,8,19,1,41,'fighter_win',100.00,950.00,9.50,'lost',0,'2026-02-09 03:23:09'),(360,8,20,1,42,'fighter_win',100.00,300.00,3.00,'lost',0,'2026-02-09 03:23:09'),(361,8,21,1,45,'fighter_win',100.00,375.00,3.75,'lost',0,'2026-02-09 03:23:09'),(362,8,22,1,47,'fighter_win',100.00,360.00,3.60,'lost',0,'2026-02-09 03:23:09'),(363,8,23,1,49,'fighter_win',100.00,270.00,2.70,'lost',0,'2026-02-09 03:23:09'),(364,8,24,1,50,'fighter_win',100.00,250.00,2.50,'won',0,'2026-02-09 03:23:09'),(365,9,1,1,2,'fighter_win',100.00,290.00,2.90,'won',0,'2026-02-09 03:23:31'),(366,9,17,1,36,'fighter_win',100.00,225.00,2.25,'won',0,'2026-02-09 03:23:31'),(367,9,18,1,38,'fighter_win',100.00,110.00,1.10,'won',0,'2026-02-09 03:23:31'),(368,9,19,1,40,'fighter_win',100.00,106.00,1.06,'won',0,'2026-02-09 03:23:31'),(369,9,20,1,43,'fighter_win',100.00,140.00,1.40,'won',0,'2026-02-09 03:23:31'),(370,9,21,1,44,'fighter_win',100.00,128.00,1.28,'won',0,'2026-02-09 03:23:31'),(371,9,22,1,46,'fighter_win',100.00,130.00,1.30,'won',0,'2026-02-09 03:23:31'),(372,9,23,1,48,'fighter_win',100.00,148.00,1.48,'won',0,'2026-02-09 03:23:31'),(373,9,24,1,51,'fighter_win',100.00,157.00,1.57,'lost',0,'2026-02-09 03:23:31'),(374,7,25,5,52,'fighter_win',100.00,173.00,1.73,'won',0,'2026-02-09 03:45:32'),(375,7,26,5,54,'fighter_win',100.00,173.00,1.73,'won',0,'2026-02-09 03:45:32'),(376,7,27,5,56,'fighter_win',100.00,220.00,2.20,'won',0,'2026-02-09 03:45:32'),(377,7,28,5,59,'fighter_win',100.00,136.00,1.36,'won',0,'2026-02-09 03:45:32'),(378,7,29,5,60,'fighter_win',100.00,108.00,1.08,'won',0,'2026-02-09 03:45:32'),(379,7,30,5,63,'fighter_win',100.00,130.00,1.30,'won',0,'2026-02-09 03:45:32'),(380,7,31,5,65,'fighter_win',100.00,191.00,1.91,'won',0,'2026-02-09 03:45:32'),(381,7,32,5,67,'fighter_win',100.00,128.00,1.28,'won',0,'2026-02-09 03:45:32'),(382,7,33,5,68,'fighter_win',100.00,167.00,1.67,'won',0,'2026-02-09 03:45:32'),(383,13,25,5,53,'fighter_win',100.00,210.00,2.10,'lost',0,'2026-02-09 03:46:10'),(384,13,26,5,55,'fighter_win',100.00,210.00,2.10,'lost',0,'2026-02-09 03:46:10'),(385,13,27,5,57,'fighter_win',100.00,230.00,2.30,'lost',0,'2026-02-09 03:46:10'),(386,13,28,5,58,'fighter_win',100.00,325.00,3.25,'won',0,'2026-02-09 03:46:10'),(387,13,29,5,61,'fighter_win',100.00,800.00,8.00,'lost',0,'2026-02-09 03:46:10'),(388,13,30,5,62,'fighter_win',100.00,350.00,3.50,'lost',0,'2026-02-09 03:46:10'),(389,13,31,5,64,'fighter_win',100.00,191.00,1.91,'lost',0,'2026-02-09 03:46:10'),(390,13,32,5,66,'fighter_win',100.00,375.00,3.75,'lost',0,'2026-02-09 03:46:10'),(391,13,33,5,69,'fighter_win',100.00,225.00,2.25,'lost',0,'2026-02-09 03:46:10'),(392,9,25,5,53,'fighter_win',100.00,210.00,2.10,'lost',0,'2026-02-09 03:46:51'),(393,9,26,5,54,'fighter_win',100.00,173.00,1.73,'won',0,'2026-02-09 03:46:51'),(394,9,27,5,56,'fighter_win',100.00,220.00,2.20,'won',0,'2026-02-09 03:46:51'),(395,9,28,5,59,'fighter_win',100.00,136.00,1.36,'lost',0,'2026-02-09 03:46:51'),(396,9,29,5,60,'fighter_win',100.00,108.00,1.08,'won',0,'2026-02-09 03:46:51'),(397,9,30,5,63,'fighter_win',100.00,130.00,1.30,'won',0,'2026-02-09 03:46:51'),(398,9,31,5,65,'fighter_win',100.00,191.00,1.91,'won',0,'2026-02-09 03:46:51'),(399,9,32,5,67,'fighter_win',100.00,128.00,1.28,'won',0,'2026-02-09 03:46:51'),(400,9,33,5,68,'fighter_win',100.00,167.00,1.67,'won',0,'2026-02-09 03:46:51'),(401,8,25,5,52,'fighter_win',100.00,173.00,1.73,'won',0,'2026-02-09 03:47:20'),(402,8,26,5,55,'fighter_win',100.00,210.00,2.10,'lost',0,'2026-02-09 03:47:20'),(403,8,27,5,57,'fighter_win',100.00,230.00,2.30,'lost',0,'2026-02-09 03:47:20'),(404,8,28,5,58,'fighter_win',100.00,325.00,3.25,'won',0,'2026-02-09 03:47:20'),(405,8,29,5,61,'fighter_win',100.00,800.00,8.00,'lost',0,'2026-02-09 03:47:20'),(406,8,30,5,62,'fighter_win',100.00,350.00,3.50,'lost',0,'2026-02-09 03:47:20'),(407,8,31,5,64,'fighter_win',100.00,191.00,1.91,'lost',0,'2026-02-09 03:47:20'),(408,8,32,5,66,'fighter_win',100.00,375.00,3.75,'lost',0,'2026-02-09 03:47:20'),(409,8,33,5,69,'fighter_win',100.00,225.00,2.25,'lost',0,'2026-02-09 03:47:20'),(419,14,1,1,2,'fighter_win',100.00,290.00,2.90,'won',0,'2026-02-09 05:34:49'),(420,14,17,1,36,'fighter_win',100.00,225.00,2.25,'won',0,'2026-02-09 05:34:49'),(421,14,18,1,38,'fighter_win',100.00,110.00,1.10,'won',0,'2026-02-09 05:34:49'),(422,14,19,1,40,'fighter_win',100.00,106.00,1.06,'won',0,'2026-02-09 05:34:49'),(423,14,20,1,43,'fighter_win',100.00,140.00,1.40,'won',0,'2026-02-09 05:34:49'),(424,14,21,1,44,'fighter_win',100.00,128.00,1.28,'won',0,'2026-02-09 05:34:49'),(425,14,22,1,46,'fighter_win',100.00,130.00,1.30,'won',0,'2026-02-09 05:34:49'),(426,14,23,1,48,'fighter_win',100.00,148.00,1.48,'won',0,'2026-02-09 05:34:49'),(427,14,24,1,50,'fighter_win',100.00,250.00,2.50,'won',0,'2026-02-09 05:34:49'),(428,14,25,5,52,'fighter_win',100.00,173.00,1.73,'won',0,'2026-02-09 05:41:19'),(429,14,26,5,54,'fighter_win',100.00,173.00,1.73,'won',0,'2026-02-09 05:41:19'),(430,14,27,5,56,'fighter_win',100.00,220.00,2.20,'won',0,'2026-02-09 05:41:19'),(431,14,28,5,58,'fighter_win',100.00,136.00,1.36,'lost',0,'2026-02-09 05:41:19'),(432,14,29,5,60,'fighter_win',100.00,108.00,1.08,'won',0,'2026-02-09 05:41:19'),(433,14,30,5,63,'fighter_win',100.00,130.00,1.30,'won',0,'2026-02-09 05:41:19'),(434,14,31,5,65,'fighter_win',100.00,191.00,1.91,'won',0,'2026-02-09 05:41:19'),(435,14,32,5,67,'fighter_win',100.00,128.00,1.28,'won',0,'2026-02-09 05:41:19'),(436,14,33,5,68,'fighter_win',100.00,167.00,1.67,'won',0,'2026-02-09 05:41:19');
/*!40000 ALTER TABLE `user_bets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_points_history`
--

DROP TABLE IF EXISTS `user_points_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_points_history` (
  `point_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `bet_id` int(11) NOT NULL,
  `fight_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `points_earned` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`point_id`),
  UNIQUE KEY `unique_bet_points` (`bet_id`),
  KEY `fk_points_fight` (`fight_id`),
  KEY `idx_user_points` (`user_id`),
  KEY `idx_event_points` (`event_id`),
  KEY `idx_bet_points` (`bet_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_points_bet` FOREIGN KEY (`bet_id`) REFERENCES `user_bets` (`bet_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_points_event` FOREIGN KEY (`event_id`) REFERENCES `dim_events` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_points_fight` FOREIGN KEY (`fight_id`) REFERENCES `fact_fights` (`fight_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_points_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks points earned by users for each bet, enabling accurate event and annual summaries';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_points_history`
--

LOCK TABLES `user_points_history` WRITE;
/*!40000 ALTER TABLE `user_points_history` DISABLE KEYS */;
INSERT INTO `user_points_history` VALUES (135,7,346,24,1,250.00,'2026-02-09 05:37:54'),(136,8,364,24,1,250.00,'2026-02-09 05:37:54'),(137,14,427,24,1,250.00,'2026-02-09 05:37:54'),(138,7,339,17,1,225.00,'2026-02-09 05:38:02'),(139,9,366,17,1,225.00,'2026-02-09 05:38:02'),(140,14,420,17,1,225.00,'2026-02-09 05:38:02'),(141,7,340,18,1,110.00,'2026-02-09 05:38:04'),(142,9,367,18,1,110.00,'2026-02-09 05:38:04'),(143,14,421,18,1,110.00,'2026-02-09 05:38:04'),(144,7,341,19,1,106.00,'2026-02-09 05:38:06'),(145,9,368,19,1,106.00,'2026-02-09 05:38:06'),(146,14,422,19,1,106.00,'2026-02-09 05:38:06'),(147,7,342,20,1,140.00,'2026-02-09 05:38:16'),(148,9,369,20,1,140.00,'2026-02-09 05:38:16'),(149,14,423,20,1,140.00,'2026-02-09 05:38:16'),(150,7,343,21,1,128.00,'2026-02-09 05:38:25'),(151,9,370,21,1,128.00,'2026-02-09 05:38:25'),(152,14,424,21,1,128.00,'2026-02-09 05:38:25'),(153,7,344,22,1,130.00,'2026-02-09 05:38:28'),(154,9,371,22,1,130.00,'2026-02-09 05:38:28'),(155,14,425,22,1,130.00,'2026-02-09 05:38:28'),(156,7,345,23,1,148.00,'2026-02-09 05:38:30'),(157,9,372,23,1,148.00,'2026-02-09 05:38:30'),(158,14,426,23,1,148.00,'2026-02-09 05:38:30'),(159,7,338,1,1,290.00,'2026-02-09 05:38:32'),(160,9,365,1,1,290.00,'2026-02-09 05:38:32'),(161,14,419,1,1,290.00,'2026-02-09 05:38:32'),(189,7,374,25,5,173.00,'2026-02-23 03:09:43'),(190,8,401,25,5,173.00,'2026-02-23 03:09:43'),(191,14,428,25,5,173.00,'2026-02-23 03:09:43'),(192,7,375,26,5,173.00,'2026-02-23 03:09:48'),(193,9,393,26,5,173.00,'2026-02-23 03:09:48'),(194,14,429,26,5,173.00,'2026-02-23 03:09:48'),(195,7,376,27,5,220.00,'2026-02-23 03:09:54'),(196,9,394,27,5,220.00,'2026-02-23 03:09:54'),(197,14,430,27,5,220.00,'2026-02-23 03:09:54'),(198,13,386,28,5,325.00,'2026-02-23 03:09:59'),(199,8,404,28,5,325.00,'2026-02-23 03:09:59'),(200,7,378,29,5,108.00,'2026-02-23 03:10:13'),(201,9,396,29,5,108.00,'2026-02-23 03:10:13'),(202,14,432,29,5,108.00,'2026-02-23 03:10:13'),(203,7,379,30,5,130.00,'2026-02-23 03:10:22'),(204,9,397,30,5,130.00,'2026-02-23 03:10:22'),(205,14,433,30,5,130.00,'2026-02-23 03:10:22'),(206,7,380,31,5,191.00,'2026-02-23 03:10:30'),(207,9,398,31,5,191.00,'2026-02-23 03:10:30'),(208,14,434,31,5,191.00,'2026-02-23 03:10:30'),(209,7,381,32,5,128.00,'2026-02-23 03:10:37'),(210,9,399,32,5,128.00,'2026-02-23 03:10:37'),(211,14,435,32,5,128.00,'2026-02-23 03:10:37'),(212,7,382,33,5,167.00,'2026-02-23 03:10:40'),(213,9,400,33,5,167.00,'2026-02-23 03:10:40'),(214,14,436,33,5,167.00,'2026-02-23 03:10:40');
/*!40000 ALTER TABLE `user_points_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `password_hash` varchar(255) NOT NULL,
  `country_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `can_bet` tinyint(1) DEFAULT 1 COMMENT 'Indica si el usuario puede realizar apuestas',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `country_id` (`country_id`),
  KEY `idx_nickname` (`nickname`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `dim_countries` (`country_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin',NULL,'test@example.com','admin','$2a$10$1yAIdXcG7W.dd80poe09Lu5ZFTwUEhe9ywtjyLeQ9uy5dSsgmQba2',1,'2026-01-14 04:39:28',0,1),(7,'dan',NULL,NULL,'user','$2a$10$XG.rE1bsf0eJI9HuVI6k7emVpGN9lbVJuHGjf9e3bogfHrt8mEz/K',NULL,'2026-01-17 20:10:36',1,0),(8,'jack',NULL,NULL,'user','$2a$10$XSP1A1xt8.tTYOEiA77tn.OlaUpFcQRynFLIX8M4vexlBJPEvADa6',NULL,'2026-01-19 04:07:16',1,0),(9,'john',NULL,NULL,'user','$2a$10$kSdPWwi082OEDRFYlvf2Y.8./zEAf.J5LY6o2YjxnfgIQfaLp3f7O',NULL,'2026-01-21 01:04:02',1,0),(13,'cubano',NULL,NULL,'user','$2a$10$6xV7YBSSjenIQyQ7GJU2vu9b/F1IQuE1X9FioTf94XdlaQh7UOfBC',NULL,'2026-02-09 02:04:37',1,0),(14,'hosea',NULL,NULL,'user','$2a$10$W/jf37k4Ro4SurDUe5G9AeOnMu6w2un3BojbKSEjNNz8lI1mKJkHS',NULL,'2026-02-09 04:31:01',1,0),(15,'newuser','newuser',NULL,'user','$2a$10$hKRbsQuE24V3kJDR8nAgTeMbO.BwErNC8iLalUGo8jT9p/BVwYroG',NULL,'2026-03-05 01:14:12',1,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_user_annual_points`
--

DROP TABLE IF EXISTS `v_user_annual_points`;
/*!50001 DROP VIEW IF EXISTS `v_user_annual_points`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_user_annual_points` AS SELECT
 1 AS `user_id`,
  1 AS `username`,
  1 AS `nickname`,
  1 AS `year`,
  1 AS `annual_points`,
  1 AS `annual_bets`,
  1 AS `events_participated` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_user_event_points`
--

DROP TABLE IF EXISTS `v_user_event_points`;
/*!50001 DROP VIEW IF EXISTS `v_user_event_points`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_user_event_points` AS SELECT
 1 AS `user_id`,
  1 AS `username`,
  1 AS `nickname`,
  1 AS `event_id`,
  1 AS `event_name`,
  1 AS `event_date`,
  1 AS `event_points`,
  1 AS `event_bets`,
  1 AS `winning_bets` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_user_points_detail`
--

DROP TABLE IF EXISTS `v_user_points_detail`;
/*!50001 DROP VIEW IF EXISTS `v_user_points_detail`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_user_points_detail` AS SELECT
 1 AS `point_id`,
  1 AS `user_id`,
  1 AS `username`,
  1 AS `nickname`,
  1 AS `bet_id`,
  1 AS `fight_id`,
  1 AS `event_id`,
  1 AS `event_name`,
  1 AS `event_date`,
  1 AS `red_fighter`,
  1 AS `blue_fighter`,
  1 AS `predicted_winner_id`,
  1 AS `predicted_winner`,
  1 AS `winner_id`,
  1 AS `actual_winner`,
  1 AS `bet_amount`,
  1 AS `potential_return`,
  1 AS `points_earned`,
  1 AS `created_at` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_user_total_points`
--

DROP TABLE IF EXISTS `v_user_total_points`;
/*!50001 DROP VIEW IF EXISTS `v_user_total_points`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_user_total_points` AS SELECT
 1 AS `user_id`,
  1 AS `username`,
  1 AS `nickname`,
  1 AS `total_points`,
  1 AS `total_bets`,
  1 AS `events_participated` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_fighter_stats`
--

DROP TABLE IF EXISTS `vw_fighter_stats`;
/*!50001 DROP VIEW IF EXISTS `vw_fighter_stats`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_fighter_stats` AS SELECT
 1 AS `fighter_id`,
  1 AS `fighter_name`,
  1 AS `country_name`,
  1 AS `country_code`,
  1 AS `total_ufc_fights`,
  1 AS `ufc_wins`,
  1 AS `ufc_losses`,
  1 AS `ufc_draws`,
  1 AS `title_fights`,
  1 AS `total_bonuses` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_fights_detailed`
--

DROP TABLE IF EXISTS `vw_fights_detailed`;
/*!50001 DROP VIEW IF EXISTS `vw_fights_detailed`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_fights_detailed` AS SELECT
 1 AS `fight_id`,
  1 AS `event_name`,
  1 AS `event_date`,
  1 AS `event_type_name`,
  1 AS `weight_class`,
  1 AS `gender`,
  1 AS `red_corner`,
  1 AS `blue_corner`,
  1 AS `winner`,
  1 AS `method_name`,
  1 AS `fight_result`,
  1 AS `final_round`,
  1 AS `final_time_seconds`,
  1 AS `is_title_fight`,
  1 AS `is_main_event`,
  1 AS `referee_name` */;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_user_annual_points`
--

/*!50001 DROP VIEW IF EXISTS `v_user_annual_points`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`mpuga`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_user_annual_points` AS select `u`.`user_id` AS `user_id`,`u`.`username` AS `username`,`u`.`nickname` AS `nickname`,year(`e`.`event_date`) AS `year`,coalesce(sum(`uph`.`points_earned`),0) AS `annual_points`,count(distinct `uph`.`bet_id`) AS `annual_bets`,count(distinct `uph`.`event_id`) AS `events_participated` from ((`users` `u` join `dim_events` `e`) left join `user_points_history` `uph` on(`u`.`user_id` = `uph`.`user_id` and `uph`.`event_id` = `e`.`event_id`)) where `u`.`role` = 'user' group by `u`.`user_id`,`u`.`username`,`u`.`nickname`,year(`e`.`event_date`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_user_event_points`
--

/*!50001 DROP VIEW IF EXISTS `v_user_event_points`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`mpuga`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_user_event_points` AS select `u`.`user_id` AS `user_id`,`u`.`username` AS `username`,`u`.`nickname` AS `nickname`,`e`.`event_id` AS `event_id`,`e`.`event_name` AS `event_name`,`e`.`event_date` AS `event_date`,coalesce(sum(`uph`.`points_earned`),0) AS `event_points`,count(distinct `uph`.`bet_id`) AS `event_bets`,count(distinct case when `uph`.`points_earned` > 0 then `uph`.`bet_id` end) AS `winning_bets` from ((`users` `u` join `dim_events` `e`) left join `user_points_history` `uph` on(`u`.`user_id` = `uph`.`user_id` and `e`.`event_id` = `uph`.`event_id`)) where `u`.`role` = 'user' group by `u`.`user_id`,`u`.`username`,`u`.`nickname`,`e`.`event_id`,`e`.`event_name`,`e`.`event_date` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_user_points_detail`
--

/*!50001 DROP VIEW IF EXISTS `v_user_points_detail`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`mpuga`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_user_points_detail` AS select `uph`.`point_id` AS `point_id`,`uph`.`user_id` AS `user_id`,`u`.`username` AS `username`,`u`.`nickname` AS `nickname`,`uph`.`bet_id` AS `bet_id`,`uph`.`fight_id` AS `fight_id`,`uph`.`event_id` AS `event_id`,`e`.`event_name` AS `event_name`,`e`.`event_date` AS `event_date`,`fr`.`fighter_name` AS `red_fighter`,`fb`.`fighter_name` AS `blue_fighter`,`ub`.`predicted_winner_id` AS `predicted_winner_id`,`pw`.`fighter_name` AS `predicted_winner`,`ff`.`winner_id` AS `winner_id`,`w`.`fighter_name` AS `actual_winner`,`ub`.`bet_amount` AS `bet_amount`,`ub`.`potential_return` AS `potential_return`,`uph`.`points_earned` AS `points_earned`,`uph`.`created_at` AS `created_at` from ((((((((`user_points_history` `uph` join `users` `u` on(`uph`.`user_id` = `u`.`user_id`)) join `user_bets` `ub` on(`uph`.`bet_id` = `ub`.`bet_id`)) join `fact_fights` `ff` on(`uph`.`fight_id` = `ff`.`fight_id`)) join `dim_events` `e` on(`uph`.`event_id` = `e`.`event_id`)) join `dim_fighters` `fr` on(`ff`.`fighter_red_id` = `fr`.`fighter_id`)) join `dim_fighters` `fb` on(`ff`.`fighter_blue_id` = `fb`.`fighter_id`)) left join `dim_fighters` `pw` on(`ub`.`predicted_winner_id` = `pw`.`fighter_id`)) left join `dim_fighters` `w` on(`ff`.`winner_id` = `w`.`fighter_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_user_total_points`
--

/*!50001 DROP VIEW IF EXISTS `v_user_total_points`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`mpuga`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_user_total_points` AS select `u`.`user_id` AS `user_id`,`u`.`username` AS `username`,`u`.`nickname` AS `nickname`,coalesce(sum(`uph`.`points_earned`),0) AS `total_points`,count(distinct `uph`.`bet_id`) AS `total_bets`,count(distinct `uph`.`event_id`) AS `events_participated` from (`users` `u` left join `user_points_history` `uph` on(`u`.`user_id` = `uph`.`user_id`)) where `u`.`role` = 'user' group by `u`.`user_id`,`u`.`username`,`u`.`nickname` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_fighter_stats`
--

/*!50001 DROP VIEW IF EXISTS `vw_fighter_stats`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`mpuga`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_fighter_stats` AS select `f`.`fighter_id` AS `fighter_id`,`f`.`fighter_name` AS `fighter_name`,`c`.`country_name` AS `country_name`,`c`.`country_code` AS `country_code`,count(distinct `ff`.`fight_id`) AS `total_ufc_fights`,sum(case when `ff`.`winner_id` = `f`.`fighter_id` then 1 else 0 end) AS `ufc_wins`,sum(case when `ff`.`winner_id` <> `f`.`fighter_id` and `fr`.`result_name` = 'Win' then 1 else 0 end) AS `ufc_losses`,sum(case when `fr`.`result_name` = 'Draw' then 1 else 0 end) AS `ufc_draws`,sum(case when `ff`.`is_title_fight` = 1 then 1 else 0 end) AS `title_fights`,count(distinct `bfb`.`bonus_id`) AS `total_bonuses` from ((((`dim_fighters` `f` left join `dim_countries` `c` on(`f`.`country_id` = `c`.`country_id`)) left join `fact_fights` `ff` on(`f`.`fighter_id` = `ff`.`fighter_red_id` or `f`.`fighter_id` = `ff`.`fighter_blue_id`)) left join `dim_fight_results` `fr` on(`ff`.`fight_result_id` = `fr`.`fight_result_id`)) left join `bridge_fight_bonuses` `bfb` on(`f`.`fighter_id` = `bfb`.`fighter_id`)) group by `f`.`fighter_id`,`f`.`fighter_name`,`c`.`country_name`,`c`.`country_code` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_fights_detailed`
--

/*!50001 DROP VIEW IF EXISTS `vw_fights_detailed`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`mpuga`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_fights_detailed` AS select `ff`.`fight_id` AS `fight_id`,`e`.`event_name` AS `event_name`,`e`.`event_date` AS `event_date`,`et`.`event_type_name` AS `event_type_name`,`wc`.`class_name` AS `weight_class`,`g`.`gender_name` AS `gender`,`fr`.`fighter_name` AS `red_corner`,`fb`.`fighter_name` AS `blue_corner`,`w`.`fighter_name` AS `winner`,`fm`.`method_name` AS `method_name`,`fres`.`result_name` AS `fight_result`,`ff`.`final_round` AS `final_round`,`ff`.`final_time_seconds` AS `final_time_seconds`,`ff`.`is_title_fight` AS `is_title_fight`,`ff`.`is_main_event` AS `is_main_event`,`ref`.`referee_name` AS `referee_name` from ((((((((((`fact_fights` `ff` join `dim_events` `e` on(`ff`.`event_id` = `e`.`event_id`)) join `dim_event_types` `et` on(`e`.`event_type_id` = `et`.`event_type_id`)) join `dim_weight_classes` `wc` on(`ff`.`weight_class_id` = `wc`.`weight_class_id`)) join `dim_genders` `g` on(`wc`.`gender_id` = `g`.`gender_id`)) join `dim_fighters` `fr` on(`ff`.`fighter_red_id` = `fr`.`fighter_id`)) join `dim_fighters` `fb` on(`ff`.`fighter_blue_id` = `fb`.`fighter_id`)) join `dim_fight_methods` `fm` on(`ff`.`method_id` = `fm`.`method_id`)) join `dim_fight_results` `fres` on(`ff`.`fight_result_id` = `fres`.`fight_result_id`)) left join `dim_fighters` `w` on(`ff`.`winner_id` = `w`.`fighter_id`)) left join `dim_referees` `ref` on(`ff`.`referee_id` = `ref`.`referee_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-04 23:27:32
