
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';

import { testConnection } from './src/models/db.js';
import router from './src/routes.js';

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
 * Configure middleware
 */

// Log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// Make the environment available to EJS views
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find templates
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Application routes
 */

// Connect the application routes
app.use(router);

// Route for testing the global error handler
app.get('/test-error', (req, res, next) => {
    next(new Error('This is a test error.'));
});

/**
 * 404 Not Found handler
 * This must come after all application routes.
 */
app.use((req, res, next) => {
    res.status(404).render('errors/404', {
        title: 'Page Not Found'
    });
});

/**
 * Global error handler
 * This must come after the 404 handler.
 */
app.use((error, req, res, next) => {
    console.error('APPLICATION ERROR:', error.stack || error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).render('errors/500', {
        title: 'Server Error',
        message: NODE_ENV === 'development'
            ? error.message
            : 'Something went wrong. Please try again later.'
    });
});

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
