
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

import {
    registrationValidation,
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    requireLogin,
    requireRole,
    showDashboard,
    showUsersPage,
    processLogout
} from './controllers/users.js';

import { getAllCategories } from './models/categories.js';

const router = express.Router();

// Administrator access middleware
const requireAdmin = requireRole('admin');

// Home page
router.get('/', (req, res) => {
    res.render('home', {
        title: 'Home'
    });
});

// User registration
router.get('/register', showUserRegistrationForm);

router.post(
    '/register',
    registrationValidation,
    processUserRegistrationForm
);

// User login
router.get('/login', showLoginForm);

router.post('/login', processLoginForm);

// User dashboard
router.get(
    '/dashboard',
    requireLogin,
    showDashboard
);

// Registered users page - administrators only
router.get(
    '/users',
    requireAdmin,
    showUsersPage
);

// User logout
router.get('/logout', processLogout);

// Organizations
router.get('/organizations', showOrganizationsPage);

// Only administrators can create organizations
router.get('/new-organization', requireAdmin, showNewOrganizationForm);

router.post(
    '/new-organization',
    requireAdmin,
    organizationValidation,
    processNewOrganizationForm
);

// Only administrators can edit organizations
router.get(
    '/edit-organization/:id',
    requireAdmin,
    showEditOrganizationForm
);

router.post(
    '/edit-organization/:id',
    requireAdmin,
    organizationValidation,
    processEditOrganizationForm
);

router.get('/organization/:id', showOrganizationDetailsPage);

// Projects
router.get('/projects', showProjectsPage);

// Only administrators can create projects
router.get('/new-project', requireAdmin, showNewProjectForm);

router.post(
    '/new-project',
    requireAdmin,
    projectValidation,
    processNewProjectForm
);

// Only administrators can edit projects
router.get(
    '/edit-project/:id',
    requireAdmin,
    showEditProjectForm
);

router.post(
    '/edit-project/:id',
    requireAdmin,
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

// Only administrators can create categories
router.get('/new-category', requireAdmin, showNewCategoryForm);

router.post(
    '/new-category',
    requireAdmin,
    categoryValidation,
    processNewCategoryForm
);

// Only administrators can edit categories
router.get(
    '/edit-category/:id',
    requireAdmin,
    showEditCategoryForm
);

router.post(
    '/edit-category/:id',
    requireAdmin,
    categoryValidation,
    processEditCategoryForm
);

router.get('/category/:id', showCategoryDetailsPage);

// Only administrators can assign categories to projects
router.get(
    '/assign-categories/:projectId',
    requireAdmin,
    showAssignCategoriesForm
);

router.post(
    '/assign-categories/:projectId',
    requireAdmin,
    processAssignCategoriesForm
);

export default router;
