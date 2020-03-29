/*
create table media
(
	id int not null
		primary key,
	item_id int not null,
	ingester varchar(255) not null,
	renderer varchar(255) not null,
	data longtext null comment '(DC2Type:json_array)',
	source longtext null,
	media_type varchar(255) null,
	storage_id varchar(190) null,
	extension varchar(255) null,
	sha256 char(64) null,
	has_original tinyint(1) not null,
	has_thumbnails tinyint(1) not null,
	position int null,
	lang varchar(190) null,
	size bigint null,

 */
export type Media = {
  id: number;
  item_id: number;
  ingester: string;
  renderer: string;
  data?: string;
  source?: string;
  media_type?: string;
  storage_id?: string;
  extension?: string;
  sha256?: string;
  has_original: number;
  has_thumbnails: number;
  position: number;
  lang?: string;
  size: number;
};
