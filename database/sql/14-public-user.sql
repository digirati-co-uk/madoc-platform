-- MySQL dump 10.13  Distrib 5.7.19, for Linux (x86_64)
--
-- Host: localhost    Database: omeka_s
-- ------------------------------------------------------
-- Server version	5.7.19

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

DROP TABLE IF EXISTS `user_canvas_mapping`;

CREATE TABLE user_canvas_mapping (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  canvas_mapping_id INT,
  user_id INT,
  bookmarked INT,
  complete_count INT,
  incomplete_count INT,
  FOREIGN KEY (canvas_mapping_id) REFERENCES iiif_integration_canvas_mapping(id),
  FOREIGN KEY (user_id) REFERENCES user(id),
  CONSTRAINT uc_user_canvas UNIQUE (user_id, canvas_mapping_id)
);
