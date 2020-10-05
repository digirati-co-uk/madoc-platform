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
-- Name: jwt_site_scopes; Type: TABLE; Schema: madoc_ts; Owner: madoc_ts
--

CREATE TABLE madoc_ts.jwt_site_scopes (
    id integer NOT NULL,
    site_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id integer,
    role text,
    scope text
);


ALTER TABLE madoc_ts.jwt_site_scopes OWNER TO madoc_ts;

--
-- Name: jwt_site_scopes_id_seq; Type: SEQUENCE; Schema: madoc_ts; Owner: madoc_ts
--

CREATE SEQUENCE madoc_ts.jwt_site_scopes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE madoc_ts.jwt_site_scopes_id_seq OWNER TO madoc_ts;

--
-- Name: jwt_site_scopes_id_seq; Type: SEQUENCE OWNED BY; Schema: madoc_ts; Owner: madoc_ts
--

ALTER SEQUENCE madoc_ts.jwt_site_scopes_id_seq OWNED BY madoc_ts.jwt_site_scopes.id;


--
-- Name: jwt_site_scopes id; Type: DEFAULT; Schema: madoc_ts; Owner: madoc_ts
--

ALTER TABLE ONLY madoc_ts.jwt_site_scopes ALTER COLUMN id SET DEFAULT nextval('madoc_ts.jwt_site_scopes_id_seq'::regclass);


--
-- Data for Name: jwt_site_scopes; Type: TABLE DATA; Schema: madoc_ts; Owner: madoc_ts
--

COPY madoc_ts.jwt_site_scopes (id, site_id, created_at, user_id, role, scope) FROM stdin;
1	1	2020-09-30 11:34:00.067214	\N	admin	site.admin
2	1	2020-09-30 11:34:00.067214	\N	admin	tasks.admin
3	1	2020-09-30 11:34:00.067214	\N	admin	models.admin
4	1	2020-09-30 11:34:00.067214	\N	reviewer	tasks.create
5	1	2020-09-30 11:34:00.067214	\N	reviewer	tasks.progress
6	1	2020-09-30 11:34:00.067214	\N	reviewer	models.revision
7	1	2020-09-30 11:34:00.067214	\N	reviewer	models.create
8	1	2020-09-30 11:34:00.067214	\N	reviewer	models.contribute
9	1	2020-09-30 11:34:00.067214	\N	reviewer	models.view_published
10	1	2020-09-30 11:34:00.067214	\N	reviewer	site.view
11	1	2020-09-30 11:34:00.067214	\N	limited-reviewer	tasks.create
12	1	2020-09-30 11:34:00.067214	\N	limited-reviewer	tasks.progress
13	1	2020-09-30 11:34:00.067214	\N	limited-reviewer	models.revision
14	1	2020-09-30 11:34:00.067214	\N	limited-reviewer	models.contribute
15	1	2020-09-30 11:34:00.067214	\N	limited-reviewer	models.view_published
16	1	2020-09-30 11:34:00.067214	\N	limited-reviewer	site.view
17	1	2020-09-30 11:34:00.067214	\N	transcriber	tasks.progress
18	1	2020-09-30 11:34:00.067214	\N	transcriber	models.revision
19	1	2020-09-30 11:34:00.067214	\N	transcriber	models.contribute
20	1	2020-09-30 11:34:00.067214	\N	transcriber	models.view_published
21	1	2020-09-30 11:34:00.067214	\N	transcriber	site.view
22	1	2020-09-30 11:34:00.067214	\N	limited-transcriber	tasks.progress
23	1	2020-09-30 11:34:00.067214	\N	limited-transcriber	models.revision
24	1	2020-09-30 11:34:00.067214	\N	limited-transcriber	models.contribute
25	1	2020-09-30 11:34:00.067214	\N	limited-transcriber	models.view_published
26	1	2020-09-30 11:34:00.067214	\N	limited-transcriber	site.view
27	1	2020-09-30 11:34:00.067214	\N	viewer	models.view_published
28	1	2020-09-30 11:34:00.067214	\N	viewer	site.view
29	1	2020-09-30 11:34:00.067214	\N	editor	models.view_published
30	1	2020-09-30 11:34:00.067214	\N	editor	site.view
34	2	2020-09-30 11:38:49.207013	\N	admin	site.admin
35	2	2020-09-30 11:38:49.207013	\N	admin	tasks.admin
36	2	2020-09-30 11:38:49.207013	\N	admin	models.admin
37	2	2020-09-30 11:38:49.207013	\N	reviewer	tasks.create
38	2	2020-09-30 11:38:49.207013	\N	reviewer	tasks.progress
39	2	2020-09-30 11:38:49.207013	\N	reviewer	models.revision
40	2	2020-09-30 11:38:49.207013	\N	reviewer	models.create
41	2	2020-09-30 11:38:49.207013	\N	reviewer	models.contribute
42	2	2020-09-30 11:38:49.207013	\N	reviewer	models.view_published
43	2	2020-09-30 11:38:49.207013	\N	reviewer	site.view
44	2	2020-09-30 11:38:49.207013	\N	limited-reviewer	tasks.create
45	2	2020-09-30 11:38:49.207013	\N	limited-reviewer	tasks.progress
46	2	2020-09-30 11:38:49.207013	\N	limited-reviewer	models.revision
47	2	2020-09-30 11:38:49.207013	\N	limited-reviewer	models.contribute
48	2	2020-09-30 11:38:49.207013	\N	limited-reviewer	models.view_published
49	2	2020-09-30 11:38:49.207013	\N	limited-reviewer	site.view
50	2	2020-09-30 11:38:49.207013	\N	transcriber	tasks.progress
51	2	2020-09-30 11:38:49.207013	\N	transcriber	models.revision
52	2	2020-09-30 11:38:49.207013	\N	transcriber	models.contribute
53	2	2020-09-30 11:38:49.207013	\N	transcriber	models.view_published
54	2	2020-09-30 11:38:49.207013	\N	transcriber	site.view
55	2	2020-09-30 11:38:49.207013	\N	limited-transcriber	tasks.progress
56	2	2020-09-30 11:38:49.207013	\N	limited-transcriber	models.revision
57	2	2020-09-30 11:38:49.207013	\N	limited-transcriber	models.contribute
58	2	2020-09-30 11:38:49.207013	\N	limited-transcriber	models.view_published
59	2	2020-09-30 11:38:49.207013	\N	limited-transcriber	site.view
60	2	2020-09-30 11:38:49.207013	\N	viewer	models.view_published
61	2	2020-09-30 11:38:49.207013	\N	viewer	site.view
62	2	2020-09-30 11:38:49.207013	\N	editor	models.view_published
63	2	2020-09-30 11:38:49.207013	\N	editor	site.view
\.


--
-- Name: jwt_site_scopes_id_seq; Type: SEQUENCE SET; Schema: madoc_ts; Owner: madoc_ts
--

SELECT pg_catalog.setval('madoc_ts.jwt_site_scopes_id_seq', 63, true);


--
-- Name: jwt_site_scopes jwt_site_scopes_pk; Type: CONSTRAINT; Schema: madoc_ts; Owner: madoc_ts
--

ALTER TABLE ONLY madoc_ts.jwt_site_scopes
    ADD CONSTRAINT jwt_site_scopes_pk PRIMARY KEY (id);


--
-- Name: jwt_site_scopes_uindex; Type: INDEX; Schema: madoc_ts; Owner: madoc_ts
--

CREATE UNIQUE INDEX jwt_site_scopes_uindex ON madoc_ts.jwt_site_scopes USING btree (id);


--
-- PostgreSQL database dump complete
--

