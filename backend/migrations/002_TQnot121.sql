begin transaction;

alter table task_question rename to _old_task_question;

create table task_question (
    task_id INTEGER not null,
    question_id INTEGER not null,
    seq_order   INTEGER,
    primary key (task_id, question_id),
    foreign key (task_id) references tasks(id) on delete cascade,
    foreign key (question_id) references questions(id) on delete cascade
);

insert into task_question (task_id, question_id, seq_order)
select task_id, question_id, seq_order
from _old_task_question;

drop table _old_task_question;

alter table tasks rename to _old_tasks;

create table tasks (
    id         INTEGER
        primary key autoincrement,
    name       TEXT,
    "group"    TEXT not null
        references groups(name) on delete restrict ,
    type       TEXT not null,
    config     TEXT,
    created_at TIMESTAMP default CURRENT_TIMESTAMP
);

insert into tasks (id, name, "group", type, config, created_at)
select id, name, "group", type, config, created_at
from _old_tasks;

drop table _old_tasks;

commit;
