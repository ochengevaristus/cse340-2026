
-- =============================================
-- CSE 340 W02: Database Retrieval
-- Community Service Projects Database
-- =============================================

BEGIN;

-- IMPORTANT:
-- This script resets these four tables.
-- Run it ONLY on a fresh or disposable database.
-- Do not run it on your existing Render database.

DROP TABLE IF EXISTS public.project_category CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.organization CASCADE;


-- =============================================
-- 1. ORGANIZATION TABLE
-- =============================================

CREATE TABLE public.organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);


-- =============================================
-- 2. PROJECTS TABLE
-- =============================================

CREATE TABLE public.projects (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    date DATE,

    CONSTRAINT fk_projects_organization
        FOREIGN KEY (organization_id)
        REFERENCES public.organization(organization_id)
        ON DELETE CASCADE
);


-- =============================================
-- 3. CATEGORIES TABLE
-- =============================================

CREATE TABLE public.categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);


-- =============================================
-- 4. PROJECT-CATEGORY JUNCTION TABLE
-- =============================================

CREATE TABLE public.project_category (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,

    PRIMARY KEY (project_id, category_id),

    CONSTRAINT fk_project_category_project
        FOREIGN KEY (project_id)
        REFERENCES public.projects(project_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_project_category_category
        FOREIGN KEY (category_id)
        REFERENCES public.categories(category_id)
        ON DELETE CASCADE
);


-- =============================================
-- 5. INSERT ORGANIZATIONS
-- =============================================

INSERT INTO public.organization
    (name, description, contact_email, logo_filename)
VALUES
(
    'BrightFuture Builders',
    'A nonprofit focused on improving community infrastructure through sustainable construction projects.',
    'info@brightfuturebuilders.org',
    'brightfuture-logo.png'
),
(
    'GreenHarvest Growers',
    'An urban farming collective promoting food sustainability and education in local neighborhoods.',
    'contact@greenharvest.org',
    'greenharvest-logo.png'
),
(
    'UnityServe Volunteers',
    'A volunteer coordination group supporting local charities and service initiatives.',
    'hello@unityserve.org',
    'unityserve-logo.png'
);


-- =============================================
-- 6. INSERT PROJECTS
-- Five projects for each organization
-- =============================================

INSERT INTO public.projects
    (organization_id, title, description, location, date)
SELECT
    o.organization_id,
    p.title,
    p.description,
    p.location,
    p.date
FROM public.organization o
JOIN (
    VALUES
    (
        'BrightFuture Builders',
        'Community School Renovation',
        'Renovating classrooms and improving learning facilities in underserved communities.',
        'Kisumu',
        DATE '2026-12-05'
    ),
    (
        'BrightFuture Builders',
        'Safe Water Initiative',
        'Installing clean water systems to improve access to safe drinking water.',
        'Kisumu County',
        DATE '2026-12-12'
    ),
    (
        'BrightFuture Builders',
        'Community Bridge Repair',
        'Repairing small community bridges to improve transportation and public safety.',
        'Siaya County',
        DATE '2026-12-19'
    ),
    (
        'BrightFuture Builders',
        'Affordable Housing Support',
        'Supporting the construction and improvement of affordable community housing.',
        'Kisumu County',
        DATE '2027-01-09'
    ),
    (
        'BrightFuture Builders',
        'Public Park Improvement',
        'Improving public parks through landscaping, seating, and recreational facilities.',
        'Kisumu',
        DATE '2027-01-16'
    ),
    (
        'GreenHarvest Growers',
        'Urban Vegetable Gardens',
        'Creating vegetable gardens in available urban spaces to improve food access.',
        'Kisumu',
        DATE '2026-12-06'
    ),
    (
        'GreenHarvest Growers',
        'School Farming Program',
        'Teaching students sustainable farming and practical food production skills.',
        'Kisumu County',
        DATE '2026-12-13'
    ),
    (
        'GreenHarvest Growers',
        'Tree Planting Campaign',
        'Planting trees to improve the environment and increase green spaces.',
        'Kisumu County',
        DATE '2026-12-20'
    ),
    (
        'GreenHarvest Growers',
        'Composting and Recycling',
        'Promoting waste reduction through composting and responsible recycling.',
        'Kisumu',
        DATE '2027-01-10'
    ),
    (
        'GreenHarvest Growers',
        'Community Food Distribution',
        'Growing and distributing fresh produce to families experiencing food insecurity.',
        'Kisumu County',
        DATE '2027-01-17'
    ),
    (
        'UnityServe Volunteers',
        'Community Clean-Up Day',
        'Organizing volunteers to clean public spaces and improve neighborhood hygiene.',
        'Kisumu',
        DATE '2026-12-07'
    ),
    (
        'UnityServe Volunteers',
        'Elderly Care Assistance',
        'Coordinating volunteers to support elderly people with basic daily needs.',
        'Kisumu County',
        DATE '2026-12-14'
    ),
    (
        'UnityServe Volunteers',
        'Youth Mentorship Program',
        'Connecting young people with mentors who provide guidance and life skills.',
        'Kisumu',
        DATE '2026-12-21'
    ),
    (
        'UnityServe Volunteers',
        'Food Donation Drive',
        'Collecting and distributing food donations to vulnerable families.',
        'Kisumu County',
        DATE '2027-01-11'
    ),
    (
        'UnityServe Volunteers',
        'Community Health Awareness',
        'Organizing educational activities to promote health and disease prevention.',
        'Kisumu',
        DATE '2027-01-18'
    )
) AS p(organization_name, title, description, location, date)
    ON o.name = p.organization_name;


-- =============================================
-- 7. INSERT CATEGORIES
-- =============================================

INSERT INTO public.categories (name, description)
VALUES
(
    'Environmental',
    'Projects focused on environmental protection and sustainability.'
),
(
    'Educational',
    'Projects supporting learning, schools, and mentorship.'
),
(
    'Community Service',
    'Projects that improve local communities through volunteer service.'
),
(
    'Health and Wellness',
    'Projects supporting health, care, and community wellbeing.'
),
(
    'Infrastructure',
    'Projects improving buildings, facilities, and public infrastructure.'
),
(
    'Food Security',
    'Projects supporting food production and distribution.'
);


-- =============================================
-- 8. ASSIGN CATEGORIES TO EVERY PROJECT
-- Each project receives two categories.
-- =============================================

INSERT INTO public.project_category (project_id, category_id)
SELECT
    p.project_id,
    c.category_id
FROM (
    VALUES
    ('Community School Renovation', 'Educational'),
    ('Community School Renovation', 'Infrastructure'),

    ('Safe Water Initiative', 'Health and Wellness'),
    ('Safe Water Initiative', 'Community Service'),

    ('Community Bridge Repair', 'Infrastructure'),
    ('Community Bridge Repair', 'Community Service'),

    ('Affordable Housing Support', 'Infrastructure'),
    ('Affordable Housing Support', 'Community Service'),

    ('Public Park Improvement', 'Environmental'),
    ('Public Park Improvement', 'Community Service'),

    ('Urban Vegetable Gardens', 'Environmental'),
    ('Urban Vegetable Gardens', 'Food Security'),

    ('School Farming Program', 'Educational'),
    ('School Farming Program', 'Food Security'),

    ('Tree Planting Campaign', 'Environmental'),
    ('Tree Planting Campaign', 'Community Service'),

    ('Composting and Recycling', 'Environmental'),
    ('Composting and Recycling', 'Community Service'),

    ('Community Food Distribution', 'Food Security'),
    ('Community Food Distribution', 'Community Service'),

    ('Community Clean-Up Day', 'Environmental'),
    ('Community Clean-Up Day', 'Community Service'),

    ('Elderly Care Assistance', 'Health and Wellness'),
    ('Elderly Care Assistance', 'Community Service'),

    ('Youth Mentorship Program', 'Educational'),
    ('Youth Mentorship Program', 'Community Service'),

    ('Food Donation Drive', 'Food Security'),
    ('Food Donation Drive', 'Community Service'),

    ('Community Health Awareness', 'Health and Wellness'),
    ('Community Health Awareness', 'Educational')
) AS assignments(project_title, category_name)
JOIN public.projects p
    ON p.title = assignments.project_title
JOIN public.categories c
    ON c.name = assignments.category_name;


-- =============================================
-- 9. VERIFICATION QUERIES
-- =============================================

-- Verify organizations
SELECT *
FROM public.organization
ORDER BY organization_id;

-- Verify projects
SELECT *
FROM public.projects
ORDER BY project_id;

-- Verify categories
SELECT *
FROM public.categories
ORDER BY category_id;

-- Verify projects, organizations, and categories
SELECT
    p.project_id,
    p.title AS project_title,
    o.name AS organization_name,
    STRING_AGG(c.name, ', ' ORDER BY c.name) AS categories
FROM public.projects p
JOIN public.organization o
    ON p.organization_id = o.organization_id
LEFT JOIN public.project_category pc
    ON p.project_id = pc.project_id
LEFT JOIN public.categories c
    ON pc.category_id = c.category_id
GROUP BY p.project_id, p.title, o.name
ORDER BY o.name, p.title;

-- Verify each organization has at least five projects
SELECT
    o.name AS organization_name,
    COUNT(p.project_id) AS total_projects
FROM public.organization o
LEFT JOIN public.projects p
    ON o.organization_id = p.organization_id
GROUP BY o.organization_id, o.name
ORDER BY o.name;

-- Verify every project has at least one category
SELECT
    p.project_id,
    p.title AS project_title,
    COUNT(pc.category_id) AS total_categories
FROM public.projects p
LEFT JOIN public.project_category pc
    ON p.project_id = pc.project_id
GROUP BY p.project_id, p.title
ORDER BY p.project_id;

COMMIT;
