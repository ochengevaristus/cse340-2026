
import { getCategoryDetails } from '../models/categories.js';

import {
    getProjectsByCategoryId
} from '../models/projects.js';

// Display all projects belonging to a category
const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;

        const category = await getCategoryDetails(categoryId);

        if (!category) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        const projects = await getProjectsByCategoryId(categoryId);

        res.render('category', {
            title: category.name,
            category,
            projects
        });
    } catch (error) {
        next(error);
    }
};

export {
    showCategoryDetailsPage
};
