
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

export { getAllProjects };
