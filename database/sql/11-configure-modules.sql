LOCK TABLES `setting` WRITE;
/*!40000 ALTER TABLE `setting` DISABLE KEYS */;

INSERT INTO `setting` VALUES

/* Annotation Studio Module */
('annotation_studio_default_moderation_status','\"open\"'),
('annotation_studio_elucidate_server','\"\"'),
('annotation_studio_resource_template','\"\"'),
('annotation_studio_use_elucidate_proxy','\"1\"'),
('annotation_studio_use_open_seadragon','\"1\"'),

/* Elucidate */
('elucidate_generator_value','\"omekaelucidatevalue\"'),
('elucidate_import_omeka_items','\"0\"'),
('elucidate_item_endpoint','\"elucidate\"'),
('elucidate_search_by_id','\"0\"'),
('elucidate_search_field_is_property','\"0\"'),
('elucidate_search_field_name','\"id\"'),
('elucidate_search_has_virtual','\"0\"'),
('elucidate_search_search_https','\"0\"'),
('elucidate_search_search_uri','\"\"'),
('elucidate_search_search_using_class','\"0\"'),
('elucidate_search_using_uri','\"0\"'),
('elucidate_search_virtual_prefix','\"\"'),
('elucidate_tacsi_url','\"\"'),
('elucidate_topic_collection_uri','\"\"'),
('elucidate_transcriptions_endpoint','\"\"')

/* end */
;

/*!40000 ALTER TABLE `setting` ENABLE KEYS */;
UNLOCK TABLES;
