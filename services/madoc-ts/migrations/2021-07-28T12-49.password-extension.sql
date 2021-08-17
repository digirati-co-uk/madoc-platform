--password-extension (up)
alter table password_creation
    add shared_hash text null;
