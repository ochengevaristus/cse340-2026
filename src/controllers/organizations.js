
import {
    getAllOrganizations,
    getOrganizationDetails
} from '../models/organizations.js';

import {
    getProjectsByOrganizationId
} from '../models/projects.js';

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

export {
    showOrganizationsPage,
    showOrganizationDetailsPage
};
