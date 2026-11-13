
import db from './db.js';

const getAllProjects = async () => {
    const query = `
        SELECT
            p.project_id,
            p.organization_id,
            p.title,
            p.description,
            p.location,
            p.date,
            o.name AS organization_name,
            ARRAY_AGG(DISTINCT c.name) FILTER (
                WHERE c.name IS NOT NULL
            ) AS categories
        FROM public.projects p
        INNER JOIN public.organization o
            ON p.organization_id = o.organization_id
        LEFT JOIN public.project_category pc
            ON p.project_id = pc.project_id
        LEFT JOIN public.categories c
            ON pc.category_id = c.category_id
        GROUP BY
            p.project_id,
            p.organization_id,
            p.title,
            p.description,
            p.location,
            p.date,
            o.name
        ORDER BY p.date ASC;
    `;

    const result = await db.query(query);
    return result.rows;
};

const getUpcomingProjects = async (numberOfProjects) => {
    const query = `
        SELECT
            p.project_id,
            p.organization_id,
            p.title,
            p.description,
            p.location,
            p.date,
            o.name AS organization_name,
            COALESCE(
                (
                    SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'category_id', c.category_id,
                            'name', c.name
                        )
                        ORDER BY c.name ASC
                    )
                    FROM public.project_category pc
                    INNER JOIN public.categories c
                        ON pc.category_id = c.category_id
                    WHERE pc.project_id = p.project_id
                ),
                '[]'::json
            ) AS categories
        FROM public.projects p
        INNER JOIN public.organization o
            ON p.organization_id = o.organization_id
        WHERE p.date >= CURRENT_DATE
        ORDER BY p.date ASC
        LIMIT $1;
    `;

    const result = await db.query(query, [numberOfProjects]);
    return result.rows;
};

const getProjectDetails = async (projectId) => {
    const query = `
        SELECT
            p.project_id,
            p.organization_id,
            p.title,
            p.description,
            p.location,
            p.date,
            o.name AS organization_name,
            ARRAY_AGG(DISTINCT c.name) FILTER (
                WHERE c.name IS NOT NULL
            ) AS categories
        FROM public.projects p
        INNER JOIN public.organization o
            ON p.organization_id = o.organization_id
        LEFT JOIN public.project_category pc
            ON p.project_id = pc.project_id
        LEFT JOIN public.categories c
            ON pc.category_id = c.category_id
        WHERE p.project_id = $1
        GROUP BY
            p.project_id,
            p.organization_id,
            p.title,
            p.description,
            p.location,
            p.date,
            o.name;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows[0];
};

const getCategoriesByProjectId = async (projectId) => {
    const query = `
        SELECT
            c.category_id,
            c.name,
            c.description
        FROM public.categories c
        INNER JOIN public.project_category pc
            ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name ASC;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows;
};

const getProjectsByCategoryId = async (categoryId) => {
    const query = `
        SELECT
            p.project_id,
            p.organization_id,
            p.title,
            p.description,
            p.location,
            p.date,
            o.name AS organization_name
        FROM public.projects p
        INNER JOIN public.organization o
            ON p.organization_id = o.organization_id
        INNER JOIN public.project_category pc
            ON p.project_id = pc.project_id
        WHERE pc.category_id = $1
        ORDER BY p.date ASC;
    `;

    const result = await db.query(query, [categoryId]);
    return result.rows;
};

const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT
            p.project_id,
            p.organization_id,
            p.title,
            p.description,
            p.location,
            p.date
        FROM public.projects p
        WHERE p.organization_id = $1
        ORDER BY p.date ASC;
    `;

    const result = await db.query(query, [organizationId]);
    return result.rows;
};

export {
    getAllProjects,
    getUpcomingProjects,
    getProjectDetails,
    getCategoriesByProjectId,
    getProjectsByCategoryId,
    getProjectsByOrganizationId
};
