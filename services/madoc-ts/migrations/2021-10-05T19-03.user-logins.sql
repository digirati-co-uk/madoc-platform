--user-logins (up)
alter table "user"
    add federated_logins jsonb;
