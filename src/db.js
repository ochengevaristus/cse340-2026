
import db from './db.js';

// Get all categories
const getAllCategories = async () => {
    const query = `
        SELECT
            category_id,
            name,
            description
        FROM public.categories
        ORDER BY name ASC;
    `;

    const result = await db.query(query);
    return result.rows;
};

// Get one category by ID
const getCategoryDetails = async (categoryId) => {
    const query = `
        SELECT
            category_id,
            name,
            description
        FROM public.categories
        WHERE category_id = $1;
    `;

    const result = await db.query(query, [categoryId]);
    return result.rows[0];
};

// Create a new category
const createCategory = async (name) => {
    const query = `
        INSERT INTO public.categories (name)
        VALUES ($1)
        RETURNING category_id;
    `;

    const result = await db.query(query, [name]);
    return result.rows[0].category_id;
};

// Update an existing category
const updateCategory = async (categoryId, name) => {
    const query = `
        UPDATE public.categories
        SET name = $1
        WHERE category_id = $2
        RETURNING category_id;
    `;

    const result = await db.query(query, [name, categoryId]);
    return result.rows[0];
};

// Assign or replace categories belonging to a project
const updateCategoryAssignments = async (projectId, categoryIds) => {
    const uniqueCategoryIds = [
        ...new Set(
            (Array.isArray(categoryIds) ? categoryIds : [])
                .map(Number)
                .filter(id => Number.isSafeInteger(id) && id > 0)
        )
    ];

    // Remove the project's previous category assignments.
    await db.query(
        `DELETE FROM public.project_category
         WHERE project_id = $1;`,
        [projectId]
    );

    // Insert the newly selected categories.
    if (uniqueCategoryIds.length > 0) {
        await db.query(
            `INSERT INTO public.project_category (
                project_id,
                category_id
            )
            SELECT $1, selected.category_id
            FROM UNNEST($2::integer[]) AS selected(category_id)
            ON CONFLICT (project_id, category_id) DO NOTHING;`,
            [projectId, uniqueCategoryIds]
        );
    }
};

export {
    getAllCategories,
    getCategoryDetails,
    createCategory,
    updateCategory,
    updateCategoryAssignments
};
