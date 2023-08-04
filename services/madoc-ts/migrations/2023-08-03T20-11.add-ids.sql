--add-ids (up)

-- Make the Id field on plugin_token a primary key
alter table plugin_token add primary key (id);

alter table site_page_slots add primary key (page_id, slot_id);

alter table site_slot_blocks add primary key (block_id, slot_id);

alter table webhook_call add primary key (id);

-- remove constraint valid_invitation from invitation
alter table user_invitations drop constraint valid_invitation;

-- Remove index iiif_metadata_uq
drop index iiif_metadata_uq;
