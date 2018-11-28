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
USE `omeka_s`;

LOCK TABLES `module` WRITE;
/*!40000 ALTER TABLE `module` DISABLE KEYS */;
INSERT INTO `module` VALUES
  ('AnnotationStudio',1,'1.0.0-rc.17'),
  ('DigiratiReferenceTheme',1,'1.0'),
  ('ElucidateProxy',1,'0.1'),
  ('PublicUser',1,'1.0.2'),
  ('ElucidateModule',1,'1.2'),
  ('CaptureModelImport',1,'1.0'),
  ('Comments',1,'0.1.0'),
  ('GoogleAnalytics',1,'1.0.1'),
  ('ResourceProvider',1,'1.0.1'),
  ('OAuth',1,'0.1'),
  ('Bookmarking',1,'0.1.0'),
  ('IIIFStorage',1,'1.0'),
  ('AutoComplete',1,'1.0')
;
/*!40000 ALTER TABLE `module` ENABLE KEYS */;
UNLOCK TABLES;
