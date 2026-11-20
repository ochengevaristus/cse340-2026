
import express from 'express';

import {
    organizationValidation,
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm
} from './controllers/organizations.js';

import {
    projectValidation,
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm
} from './controllers/projects.js';

import {
    categoryValidation,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm
} from './controllers/categories.js';

import { getAllCategories } from './models/categories.js';

const router = express.Router();

// Home page
router.get('/', (req, res) => {
    res.render('home', {
        title: 'Home'
    });
});

// Organizations
router.get('/organizations', showOrganizationsPage);

router.get('/new-organization', showNewOrganizationForm);
router.post(
    '/new-organization',
    organizationValidation,
    processNewOrganizationForm
);

router.get('/edit-organization/:id', showEditOrganizationForm);
router.post(
    '/edit-organization/:id',
    organizationValidation,
    processEditOrganizationForm
);

router.get('/organization/:id', showOrganizationDetailsPage);

// Projects
router.get('/projects', showProjectsPage);

router.get('/new-project', showNewProjectForm);
router.post(
    '/new-project',
    projectValidation,
    processNewProjectForm
);

router.get('/edit-project/:id', showEditProjectForm);
router.post(
    '/edit-project/:id',
    projectValidation,
    processEditProjectForm
);

router.get('/project/:id', showProjectDetailsPage);

// Categories
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await getAllCategories();

        res.render('categories', {
            title: 'Categories',
            categories
        });
    } catch (error) {
        next(error);
    }
});

router.get('/new-category', showNewCategoryForm);
router.post(
    '/new-category',
    categoryValidation,
    processNewCategoryForm
);

router.get('/edit-category/:id', showEditCategoryForm);
router.post(
    '/edit-category/:id',
    categoryValidation,
    processEditCategoryForm
);

router.get('/category/:id', showCategoryDetailsPage);

// Assign categories to projects
router.get(
    '/assign-categories/:projectId',
    showAssignCategoriesForm
);

router.post(
    '/assign-categories/:projectId',
    processAssignCategoriesForm
);

export default router;
