--user-extensions (up)
create table password_creation
(
    id text not null
        constraint password_creation_pk
            primary key,
    user_id integer
        constraint password_creation_user_id_user_fk
            references "user"
            on update cascade on delete cascade,
    created timestamp default CURRENT_TIMESTAMP not null,
    activate boolean default false
);

create table user_invitations
(
    id serial not null,
    invitation_id text not null,
    owner_id integer
        constraint user_invitations_owner_id_user_fk
            references "user"
            on update cascade on delete set null,
    site_id int not null,
    role text not null,
    site_role text not null,
    expires timestamp,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    uses_left integer constraint valid_invitation check (uses_left >= 0),
    message json
);

create unique index user_invitations_id_uindex
    on user_invitations (id);

create unique index user_invitations_invitation_id_uindex
    on user_invitations (invitation_id);

create index user_invitations_owner_id
    on user_invitations (owner_id);

alter table user_invitations
    add constraint user_invitations_pk
        primary key (id);


-- New table, not in Omeka
create table user_invitations_redeem
(
    user_id int not null
        constraint user_invitations_redeem_user_id_fk
            references "user"
            on delete cascade,
    invite_id int not null
        constraint user_invitations_redeem_user_invitations_id_fk
            references user_invitations (id)
            on delete cascade,
    redeemed_at timestamp default CURRENT_TIMESTAMP not null,
    constraint user_invitations_redeem_pk
        primary key (user_id, invite_id)
);
