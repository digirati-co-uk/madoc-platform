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

LOCK TABLES `vocabulary` WRITE;
/*!40000 ALTER TABLE `vocabulary` DISABLE KEYS */;
INSERT INTO `vocabulary` VALUES
(1,NULL,'http://purl.org/dc/terms/','dcterms','Dublin Core','Basic resource metadata (DCMI Metadata Terms)'),
(2,NULL,'http://purl.org/dc/dcmitype/','dctype','Dublin Core Type','Basic resource types (DCMI Type Vocabulary)'),
(3,NULL,'http://purl.org/ontology/bibo/','bibo','Bibliographic Ontology','Bibliographic metadata (BIBO)'),
(4,NULL,'http://xmlns.com/foaf/0.1/','foaf','Friend of a Friend','Relationships between people and organizations (FOAF)'),
(5,1,'http://www.digirati.com/ns/crowds','crowds','Crowds: Crowd Source Vocabulary for defining capture models.','Crowds: Crowd Source Vocabulary for defining capture models '),
(6,1,'http://www.digirati.com/ns/madoc','madoc','Madoc: Crowd Source Vocabulary for rendering UI','Madoc: Crowd Source Vocabulary for rendering UI'),
(7,1,'http://www.w3.org/2000/01/rdf-schema','rdfs','The RDF Schema vocabulary (RDFS)','The RDF Schema vocabulary (RDFS)'),
(8,1,'http://iiif.io/api/presentation/2#','sc','Shared Canvas',''),
(9,1,'http://iiif.io/api/image/2#','iiif','IIIF Image',''),
(10,1,'http://www.w3.org/2003/12/exif/ns#','exif','Exif',''),
(11,1,'http://www.w3.org/ns/oa#','oa','Open Annotation',''),
(12,1,'http://rdfs.org/sioc/services#','svcs','SIOC Services Ontology Module Namespace', '');
/*!40000 ALTER TABLE `vocabulary` ENABLE KEYS */;
UNLOCK TABLES;
