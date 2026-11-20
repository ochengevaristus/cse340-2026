
import { body, validationResult } from 'express-validator';

import {
    getAllOrganizations,
    getOrganizationDetails,
    createOrganization,
    updateOrganization
} from '../models/organizations.js';

import {
    getProjectsByOrganizationId
} from '../models/projects.js';

// Validation rules for organization forms
const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required.')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters.'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required.')
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters.'),

    body('contactEmail')
        .trim()
        .notEmpty()
        .withMessage('Contact email is required.')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail()
];

// Display all organizations
const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();

        res.render('organizations', {
            title: 'Organizations',
            organizations
        });
    } catch (error) {
        next(error);
    }
};

// Display one organization's details and projects
const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;

        const organization = await getOrganizationDetails(organizationId);

        if (!organization) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        const projects = await getProjectsByOrganizationId(organizationId);

        res.render('organization', {
            title: organization.name,
            organization,
            projects
        });
    } catch (error) {
        next(error);
    }
};

// Display the new organization form
const showNewOrganizationForm = (req, res) => {
    res.render('organization-form', {
        title: 'Add Organization',
        heading: 'Add New Organization',
        action: '/new-organization',
        organization: {}
    });
};

// Process the new organization form
const processNewOrganizationForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(error => error.msg));
            return res.redirect('/new-organization');
        }

        const {
            name,
            description,
            contactEmail
        } = req.body;

        const logoFilename = 'placeholder-logo.png';

        const organizationId = await createOrganization(
            name,
            description,
            contactEmail,
            logoFilename
        );

        req.flash('success', 'Organization added successfully!');

        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        next(error);
    }
};

// Display the edit organization form
const showEditOrganizationForm = async (req, res, next) => {
    try {
        const organization = await getOrganizationDetails(req.params.id);

        if (!organization) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        res.render('organization-form', {
            title: 'Edit Organization',
            heading: 'Edit Organization',
            action: `/edit-organization/${organization.organization_id}`,
            organization
        });
    } catch (error) {
        next(error);
    }
};

// Process organization updates
const processEditOrganizationForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(error => error.msg));
            return res.redirect(`/edit-organization/${req.params.id}`);
        }

        const {
            name,
            description,
            contactEmail,
            logoFilename
        } = req.body;

        const existingOrganization = await getOrganizationDetails(req.params.id);

        if (!existingOrganization) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        await updateOrganization(
            req.params.id,
            name,
            description,
            contactEmail,
            logoFilename?.trim() || existingOrganization.logo_filename
        );

        req.flash('success', 'Organization updated successfully!');

        res.redirect(`/organization/${req.params.id}`);
    } catch (error) {
        next(error);
    }
};

export {
    organizationValidation,
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm
};
