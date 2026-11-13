
import express from 'express';

import {
    showOrganizationsPage,
    showOrganizationDetailsPage
} from './controllers/organizations.js';

import {
    showProjectsPage,
    showProjectDetailsPage
} from './controllers/projects.js';

import {
    showCategoryDetailsPage
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
router.get('/organization/:id', showOrganizationDetailsPage);

// Projects
router.get('/projects', showProjectsPage);
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

router.get('/category/:id', showCategoryDetailsPage);

export default router;
