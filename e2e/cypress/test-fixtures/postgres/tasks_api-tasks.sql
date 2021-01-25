--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3 (Debian 12.3-1.pgdg100+1)
-- Dumped by pg_dump version 12.3 (Debian 12.3-1.pgdg100+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tasks; Type: TABLE; Schema: tasks_api; Owner: tasks_api
--

CREATE TABLE tasks_api.tasks (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    type text,
    subject text,
    status integer,
    status_text text,
    state jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    parent_task uuid,
    parameters jsonb,
    creator_id text,
    creator_name text,
    assignee_id text,
    assignee_is_service boolean,
    assignee_name text,
    context jsonb NOT NULL,
    events text[],
    modified_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    root_task uuid,
    subject_parent text
);


ALTER TABLE tasks_api.tasks OWNER TO tasks_api;

--
-- Data for Name: tasks; Type: TABLE DATA; Schema: tasks_api; Owner: tasks_api
--

COPY tasks_api.tasks (id, name, description, type, subject, status, status_text, state, created_at, parent_task, parameters, creator_id, creator_name, assignee_id, assignee_is_service, assignee_name, context, events, modified_at, root_task, subject_parent) FROM stdin;
\.


--
-- Name: tasks tasks_pk; Type: CONSTRAINT; Schema: tasks_api; Owner: tasks_api
--

ALTER TABLE ONLY tasks_api.tasks
    ADD CONSTRAINT tasks_pk PRIMARY KEY (id);


--
-- Name: assignee_id_idx; Type: INDEX; Schema: tasks_api; Owner: tasks_api
--

CREATE INDEX assignee_id_idx ON tasks_api.tasks USING btree (assignee_id);


--
-- Name: creator_id_idx; Type: INDEX; Schema: tasks_api; Owner: tasks_api
--

CREATE INDEX creator_id_idx ON tasks_api.tasks USING btree (creator_id);


--
-- Name: parent_task_idx; Type: INDEX; Schema: tasks_api; Owner: tasks_api
--

CREATE INDEX parent_task_idx ON tasks_api.tasks USING btree (parent_task);


--
-- Name: tasks_id_uindex; Type: INDEX; Schema: tasks_api; Owner: tasks_api
--

CREATE UNIQUE INDEX tasks_id_uindex ON tasks_api.tasks USING btree (id);


--
-- Name: tasks_root_task_index; Type: INDEX; Schema: tasks_api; Owner: tasks_api
--

CREATE INDEX tasks_root_task_index ON tasks_api.tasks USING btree (root_task);


--
-- Name: tasks_subject_index; Type: INDEX; Schema: tasks_api; Owner: tasks_api
--

CREATE INDEX tasks_subject_index ON tasks_api.tasks USING btree (subject);


--
-- Name: tasks tasks_tasks_id_fk; Type: FK CONSTRAINT; Schema: tasks_api; Owner: tasks_api
--

ALTER TABLE ONLY tasks_api.tasks
    ADD CONSTRAINT tasks_tasks_id_fk FOREIGN KEY (parent_task) REFERENCES tasks_api.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_tasks_id_fk_2; Type: FK CONSTRAINT; Schema: tasks_api; Owner: tasks_api
--

ALTER TABLE ONLY tasks_api.tasks
    ADD CONSTRAINT tasks_tasks_id_fk_2 FOREIGN KEY (root_task) REFERENCES tasks_api.tasks(id);


--
-- PostgreSQL database dump complete
--

