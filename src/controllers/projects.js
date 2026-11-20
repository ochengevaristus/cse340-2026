
import { body, validationResult } from 'express-validator';

import {
    getUpcomingProjects,
    getProjectDetails,
    getCategoriesByProjectId,
    createProject,
    updateProject
} from '../models/projects.js';

import { getAllOrganizations } from '../models/organizations.js';

// Validation rules for project forms
const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Project title is required.')
        .isLength({ min: 3, max: 150 })
        .withMessage('Project title must be between 3 and 150 characters.'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Project description is required.')
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters.'),

    body('location')
        .trim()
        .optional({ checkFalsy: true })
        .isLength({ max: 255 })
        .withMessage('Location cannot exceed 255 characters.'),

    body('date')
        .trim()
        .notEmpty()
        .withMessage('Project date is required.')
        .isISO8601()
        .withMessage('Please enter a valid project date.'),

    body('organizationId')
        .trim()
        .notEmpty()
        .withMessage('Please select an organization.')
        .isInt({ min: 1 })
        .withMessage('Please select a valid organization.')
];

// Display the five upcoming projects
const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(5);

        res.render('projects', {
            title: 'Service Projects',
            projects
        });
    } catch (error) {
        next(error);
    }
};

// Display details for one project
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        const project = await getProjectDetails(projectId);

        if (!project) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        const categories = await getCategoriesByProjectId(projectId);

        res.render('project', {
            title: project.title,
            project,
            categories
        });
    } catch (error) {
        next(error);
    }
};

// Display the new project form
const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();

        res.render('project-form', {
            title: 'Add Project',
            heading: 'Add New Project',
            action: '/new-project',
            project: {},
            organizations
        });
    } catch (error) {
        next(error);
    }
};

// Process the new project form
const processNewProjectForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(error => error.msg));
            return res.redirect('/new-project');
        }

        const {
            title,
            description,
            location,
            date,
            organizationId
        } = req.body;

        const projectId = await createProject(
            title,
            description,
            location,
            date,
            organizationId
        );

        req.flash('success', 'Project created successfully!');

        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

// Display the edit project form
const showEditProjectForm = async (req, res, next) => {
    try {
        const project = await getProjectDetails(req.params.id);

        if (!project) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        const organizations = await getAllOrganizations();

        res.render('project-form', {
            title: 'Edit Project',
            heading: 'Edit Project',
            action: `/edit-project/${project.project_id}`,
            project,
            organizations
        });
    } catch (error) {
        next(error);
    }
};

// Process project updates
const processEditProjectForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(error => error.msg));
            return res.redirect(`/edit-project/${req.params.id}`);
        }

        const existingProject = await getProjectDetails(req.params.id);

        if (!existingProject) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        const {
            title,
            description,
            location,
            date,
            organizationId
        } = req.body;

        await updateProject(
            req.params.id,
            title,
            description,
            location,
            date,
            organizationId
        );

        req.flash('success', 'Project updated successfully!');

        res.redirect(`/project/${req.params.id}`);
    } catch (error) {
        next(error);
    }
};

export {
    projectValidation,
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm
};
