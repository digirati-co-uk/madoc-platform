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

LOCK TABLES `resource_class` WRITE;
/*!40000 ALTER TABLE `resource_class` DISABLE KEYS */;
INSERT INTO `resource_class` VALUES
  (1,NULL,1,'Agent','Agent','A resource that acts or has the power to act.'),
  (2,NULL,1,'AgentClass','Agent Class','A group of agents.'),
  (3,NULL,1,'BibliographicResource','Bibliographic Resource','A book, article, or other documentary resource.'),
  (4,NULL,1,'FileFormat','File Format','A digital resource format.'),
  (5,NULL,1,'Frequency','Frequency','A rate at which something recurs.'),
  (6,NULL,1,'Jurisdiction','Jurisdiction','The extent or range of judicial, law enforcement, or other authority.'),
  (7,NULL,1,'LicenseDocument','License Document','A legal document giving official permission to do something with a Resource.'),
  (8,NULL,1,'LinguisticSystem','Linguistic System','A system of signs, symbols, sounds, gestures, or rules used in communication.'),
  (9,NULL,1,'Location','Location','A spatial region or named place.'),
  (10,NULL,1,'LocationPeriodOrJurisdiction','Location, Period, or Jurisdiction','A location, period of time, or jurisdiction.'),
  (11,NULL,1,'MediaType','Media Type','A file format or physical medium.'),
  (12,NULL,1,'MediaTypeOrExtent','Media Type or Extent','A media type or extent.'),
  (13,NULL,1,'MethodOfInstruction','Method of Instruction','A process that is used to engender knowledge, attitudes, and skills.'),
  (14,NULL,1,'MethodOfAccrual','Method of Accrual','A method by which resources are added to a collection.'),
  (15,NULL,1,'PeriodOfTime','Period of Time','An interval of time that is named or defined by its start and end dates.'),
  (16,NULL,1,'PhysicalMedium','Physical Medium','A physical material or carrier.'),
  (17,NULL,1,'PhysicalResource','Physical Resource','A material thing.'),
  (18,NULL,1,'Policy','Policy','A plan or course of action by an authority, intended to influence and determine decisions, actions, and other matters.'),
  (19,NULL,1,'ProvenanceStatement','Provenance Statement','A statement of any changes in ownership and custody of a resource since its creation that are significant for its authenticity, integrity, and interpretation.'),
  (20,NULL,1,'RightsStatement','Rights Statement','A statement about the intellectual property rights (IPR) held in or over a Resource, a legal document giving official permission to do something with a resource, or a statement about access rights.'),
  (21,NULL,1,'SizeOrDuration','Size or Duration','A dimension or extent, or a time taken to play or execute.'),
  (22,NULL,1,'Standard','Standard','A basis for comparison; a reference point against which other things can be evaluated.'),
  (23,NULL,2,'Collection','Collection','An aggregation of resources.'),
  (24,NULL,2,'Dataset','Dataset','Data encoded in a defined structure.'),
  (25,NULL,2,'Event','Event','A non-persistent, time-based occurrence.'),
  (26,NULL,2,'Image','Image','A visual representation other than text.'),
  (27,NULL,2,'InteractiveResource','Interactive Resource','A resource requiring interaction from the user to be understood, executed, or experienced.'),
  (28,NULL,2,'Service','Service','A system that provides one or more functions.'),
  (29,NULL,2,'Software','Software','A computer program in source or compiled form.'),
  (30,NULL,2,'Sound','Sound','A resource primarily intended to be heard.'),
  (31,NULL,2,'Text','Text','A resource consisting primarily of words for reading.'),
  (32,NULL,2,'PhysicalObject','Physical Object','An inanimate, three-dimensional object or substance.'),
  (33,NULL,2,'StillImage','Still Image','A static visual representation.'),
  (34,NULL,2,'MovingImage','Moving Image','A series of visual representations imparting an impression of motion when shown in succession.'),
  (35,NULL,3,'AcademicArticle','Academic Article','A scholarly academic article, typically published in a journal.'),
  (36,NULL,3,'Article','Article','A written composition in prose, usually nonfiction, on a specific topic, forming an independent part of a book or other publication, as a newspaper or magazine.'),
  (37,NULL,3,'AudioDocument','audio document','An audio document; aka record.'),
  (38,NULL,3,'AudioVisualDocument','audio-visual document','An audio-visual document; film, video, and so forth.'),
  (39,NULL,3,'Bill','Bill','Draft legislation presented for discussion to a legal body.'),
  (40,NULL,3,'Book','Book','A written or printed work of fiction or nonfiction, usually on sheets of paper fastened or bound together within covers.'),
  (41,NULL,3,'BookSection','Book Section','A section of a book.'),
  (42,NULL,3,'Brief','Brief','A written argument submitted to a court.'),
  (43,NULL,3,'Chapter','Chapter','A chapter of a book.'),
  (44,NULL,3,'Code','Code','A collection of statutes.'),
  (45,NULL,3,'CollectedDocument','Collected Document','A document that simultaneously contains other documents.'),
  (46,NULL,3,'Collection','Collection','A collection of Documents or Collections'),
  (47,NULL,3,'Conference','Conference','A meeting for consultation or discussion.'),
  (48,NULL,3,'CourtReporter','Court Reporter','A collection of legal cases.'),
  (49,NULL,3,'Document','Document','A document (noun) is a bounded physical representation of body of information designed with the capacity (and usually intent) to communicate. A document may manifest symbolic, diagrammatic or sensory-representational information.'),
  (50,NULL,3,'DocumentPart','document part','a distinct part of a larger document or collected document.'),
  (51,NULL,3,'DocumentStatus','Document Status','The status of the publication of a document.'),
  (52,NULL,3,'EditedBook','Edited Book','An edited book.'),
  (53,NULL,3,'Email','EMail','A written communication addressed to a person or organization and transmitted electronically.'),
  (54,NULL,3,'Event','Event',NULL),
  (55,NULL,3,'Excerpt','Excerpt','A passage selected from a larger work.'),
  (56,NULL,3,'Film','Film','aka movie.'),
  (57,NULL,3,'Hearing','Hearing','An instance or a session in which testimony and arguments are presented, esp. before an official, as a judge in a lawsuit.'),
  (58,NULL,3,'Image','Image','A document that presents visual or diagrammatic information.'),
  (59,NULL,3,'Interview','Interview','A formalized discussion between two or more people.'),
  (60,NULL,3,'Issue','Issue','something that is printed or published and distributed, esp. a given number of a periodical'),
  (61,NULL,3,'Journal','Journal','A periodical of scholarly journal Articles.'),
  (62,NULL,3,'LegalCaseDocument','Legal Case Document','A document accompanying a legal case.'),
  (63,NULL,3,'LegalDecision','Decision','A document containing an authoritative determination (as a decree or judgment) made after consideration of facts or law.'),
  (64,NULL,3,'LegalDocument','Legal Document','A legal document; for example, a court decision, a brief, and so forth.'),
  (65,NULL,3,'Legislation','Legislation','A legal document proposing or enacting a law or a group of laws.'),
  (66,NULL,3,'Letter','Letter','A written or printed communication addressed to a person or organization and usually transmitted by mail.'),
  (67,NULL,3,'Magazine','Magazine','A periodical of magazine Articles. A magazine is a publication that is issued periodically, usually bound in a paper cover, and typically contains essays, stories, poems, etc., by many writers, and often photographs and drawings, frequently specializing in a particular subject or area, as hobbies, news, or sports.'),
  (68,NULL,3,'Manual','Manual','A small reference book, especially one giving instructions.'),
  (69,NULL,3,'Manuscript','Manuscript','An unpublished Document, which may also be submitted to a publisher for publication.'),
  (70,NULL,3,'Map','Map','A graphical depiction of geographic features.'),
  (71,NULL,3,'MultiVolumeBook','Multivolume Book','A loose, thematic, collection of Documents, often Books.'),
  (72,NULL,3,'Newspaper','Newspaper','A periodical of documents, usually issued daily or weekly, containing current news, editorials, feature articles, and usually advertising.'),
  (73,NULL,3,'Note','Note','Notes or annotations about a resource.'),
  (74,NULL,3,'Patent','Patent','A document describing the exclusive right granted by a government to an inventor to manufacture, use, or sell an invention for a certain number of years.'),
  (75,NULL,3,'Performance','Performance','A public performance.'),
  (76,NULL,3,'Periodical','Periodical','A group of related documents issued at regular intervals.'),
  (77,NULL,3,'PersonalCommunication','Personal Communication','A communication between an agent and one or more specific recipients.'),
  (78,NULL,3,'PersonalCommunicationDocument','Personal Communication Document','A personal communication manifested in some document.'),
  (79,NULL,3,'Proceedings','Proceedings','A compilation of documents published from an event, such as a conference.'),
  (80,NULL,3,'Quote','Quote','An excerpted collection of words.'),
  (81,NULL,3,'ReferenceSource','Reference Source','A document that presents authoritative reference information, such as a dictionary or encylopedia .'),
  (82,NULL,3,'Report','Report','A document describing an account or statement describing in detail an event, situation, or the like, usually as the result of observation, inquiry, etc..'),
  (83,NULL,3,'Series','Series','A loose, thematic, collection of Documents, often Books.'),
  (84,NULL,3,'Slide','Slide','A slide in a slideshow'),
  (85,NULL,3,'Slideshow','Slideshow','A presentation of a series of slides, usually presented in front of an audience with written text and images.'),
  (86,NULL,3,'Standard','Standard','A document describing a standard'),
  (87,NULL,3,'Statute','Statute','A bill enacted into law.'),
  (88,NULL,3,'Thesis','Thesis','A document created to summarize research findings associated with the completion of an academic degree.'),
  (89,NULL,3,'ThesisDegree','Thesis degree','The academic degree of a Thesis'),
  (90,NULL,3,'Webpage','Webpage','A web page is an online document available (at least initially) on the world wide web. A web page is written first and foremost to appear on the web, as distinct from other online resources such as books, manuscripts or audio documents which use the web primarily as a distribution mechanism alongside other more traditional methods such as print.'),
  (91,NULL,3,'Website','Website','A group of Webpages accessible on the Web.'),
  (92,NULL,3,'Workshop','Workshop','A seminar, discussion group, or the like, that emphasizes zxchange of ideas and the demonstration and application of techniques, skills, etc.'),
  (93,NULL,4,'LabelProperty','Label Property','A foaf:LabelProperty is any RDF property with texual values that serve as labels.'),
  (94,NULL,4,'Person','Person','A person.'),
  (95,NULL,4,'Agent','Agent','An agent (eg. person, group, software or physical artifact).'),
  (96,NULL,4,'Document','Document','A document.'),
  (97,NULL,4,'Organization','Organization','An organization.'),
  (98,NULL,4,'Group','Group','A class of Agents.'),
  (99,NULL,4,'Project','Project','A project (a collective endeavour of some kind).'),
  (100,NULL,4,'Image','Image','An image.'),
  (101,NULL,4,'PersonalProfileDocument','PersonalProfileDocument','A personal profile RDF document.'),
  (102,NULL,4,'OnlineAccount','Online Account','An online account.'),
  (103,NULL,4,'OnlineGamingAccount','Online Gaming Account','An online gaming account.'),
  (104,NULL,4,'OnlineEcommerceAccount','Online E-commerce Account','An online e-commerce account.'),
  (105,NULL,4,'OnlineChatAccount','Online Chat Account','An online chat account.'),
  (106,1,7,'Resource','Resource','The class resource, everything.'),
  (107,1,7,'Class','Class','The concept of Class'),
  (108,1,7,'Literal','Literal','This represents the set of atomic values, eg. textual strings.'),
  (109,1,7,'Container','Container','This represents the set Containers.'),
  (110,1,7,'ContainerMembershipProperty','ContainerMembershipProperty','The container membership properties, rdf:1, rdf:2, ..., all of which are sub-properties of member.'),
  (111,1,8,'Zone','Zone','Used to group annotations together in an area of a Canvas, for example to model columns, foldouts or palimpsests; Note that Zones are not currently used in the IIIF Presentation API.'),
  (112,1,8,'AnnotationList','AnnotationList','AnnotationLists are an ordered list of Annotation objects. Typically all Annnotations in a list target the same Canvas'),
  (113,1,8,'Sequence','Sequence','The sequence conveys the ordering of the views of the object.'),
  (114,1,8,'ViewingHint','ViewingHint',NULL),
  (115,1,8,'Canvas','Canvas','The canvas represents an individual page or view and acts as a central point for laying out the different content resources that make up the display.'),
  (116,1,8,'Layer','Layer','Layers are lists of AnnotationLists to group them together, for example to create the set of lists that make up a particular translation/edition of a text'),
  (117,1,8,'Manifest','Manifest','The manifest resource represents a single object and any intellectual work or works embodied within that object'),
  (118,1,8,'Range','Range','Ranges describe additional structure within an object, such as newspaper articles that span pages, the range of non-content-bearing pages at the beginning of a work, or chapters within a book'),
  (119,1,8,'Collection','Collection','Collections are used to list the manifests available for viewing, and to describe the structures, hierarchies or collections that the physical objects are part of.'),
  (120,1,8,'ViewingDirection','ViewingDirection',NULL);
/*!40000 ALTER TABLE `resource_class` ENABLE KEYS */;
UNLOCK TABLES;
