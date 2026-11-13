
import db from './db.js';

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

export { getAllCategories, getCategoryDetails };
