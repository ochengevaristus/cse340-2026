
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';

import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllProjects } from './src/models/projects.js';
import { getAllCategories } from './src/models/categories.js';

// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number
const PORT = process.env.PORT || 3000;

// Get the current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();

/**
 * Configure Express middleware
 */

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find templates
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Routes
 */

// Home page
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Home'
    });
});

// Organizations page
app.get('/organizations', async (req, res) => {
    try {
        const organizations = await getAllOrganizations();

        console.log('Organizations retrieved:', organizations.length);

        res.render('organizations', {
            title: 'Organizations',
            organizations
        });
    } catch (error) {
        console.error(
            'ORGANIZATIONS PAGE ERROR:',
            error.stack || error
        );

        res.status(500).send(
            'Unable to display organizations.'
        );
    }
});

// Projects page
app.get('/projects', async (req, res) => {
    try {
        const projects = await getAllProjects();

        console.log('Projects retrieved:', projects.length);

        res.render('projects', {
            title: 'Service Projects',
            projects
        });
    } catch (error) {
        console.error(
            'PROJECTS PAGE ERROR:',
            error.stack || error
        );

        res.status(500).send(
            'Unable to display service projects.'
        );
    }
});

// Categories page
app.get('/categories', async (req, res) => {
    try {
        const categories = await getAllCategories();

        console.log('Categories retrieved:', categories.length);

        res.render('categories', {
            title: 'Categories',
            categories
        });
    } catch (error) {
        console.error(
            'CATEGORIES PAGE ERROR:',
            error.stack || error
        );

        res.status(500).send(
            'Unable to display categories.'
        );
    }
});

/**
 * Start the server and test the database connection
 */

/**
 * Start the server and test the database connection
 */

const server = app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);

    testConnection()
        .catch(error => {
            console.error('Database connection failed:', error);
        });
});

server.on('error', (error) => {
    console.error('Server startup error:', error);
});
