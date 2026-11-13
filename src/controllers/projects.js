
import {
    getUpcomingProjects,
    getProjectDetails,
    getCategoriesByProjectId
} from '../models/projects.js';

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

export {
    showProjectsPage,
    showProjectDetailsPage
};
