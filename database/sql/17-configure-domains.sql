LOCK TABLES `setting` WRITE;
/*!40000 ALTER TABLE `setting` DISABLE KEYS */;

INSERT INTO `setting` VALUES

/* Annotation Studio Module */
('annotation_studio_site_domain','\"http:\\/\\/localhost:8888\"'),
('elucidate_proxy_url','\"madoc-annotation-server:8080/annotation/w3c/\"'),
('elucidate_server_url','\"madoc-annotation-server:8080/annotation/w3c/\"'),
('elucidate_site_domain','\"localhost:8888\"'),
/* end */
;

/*!40000 ALTER TABLE `setting` ENABLE KEYS */;
UNLOCK TABLES;
