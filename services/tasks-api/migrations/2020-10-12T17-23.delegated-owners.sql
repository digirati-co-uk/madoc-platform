--delegated-owner (up)
alter table tasks
    add delegated_owners text[];

alter table tasks
    add delegated_task uuid;

alter table tasks
    add constraint tasks_delegate_task_id_fk
        foreign key (delegated_task) references tasks
            on delete cascade;

do
language plpgsql
$$
    declare
        t record;
    begin
        for t in select * from tasks
            loop
                begin
                    raise notice 'Migrating reviewId on task %', t.id;
                    update tasks set
                        delegated_task = (t.state ->> 'reviewTask')::uuid
                    where id = t.id;
                exception
                    when check_violation then
                        raise notice 'skipped task %', t.id;
                end;
            end loop;
    end;
$$;
