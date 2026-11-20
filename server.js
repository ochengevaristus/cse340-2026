
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import session from 'express-session';

import { testConnection } from './src/models/db.js';
import router from './src/routes.js';

// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'development';

// Define the port number
const PORT = process.env.PORT || 3000;

// Get the current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();

// Trust the Render proxy when running in production
if (NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

/**
 * Configure middleware
 */

// Log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// Parse submitted form data
app.use(express.urlencoded({ extended: true }));

// Parse JSON request data
app.use(express.json());

// Configure sessions
if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not defined in the environment variables.');
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Configure flash messages
app.use((req, res, next) => {
    req.flash = (type, message) => {
        if (!req.session.flashMessages) {
            req.session.flashMessages = {};
        }

        if (message === undefined) {
            const messages = req.session.flashMessages[type] || [];
            delete req.session.flashMessages[type];
            return messages;
        }

        if (!req.session.flashMessages[type]) {
            req.session.flashMessages[type] = [];
        }

        const newMessages = Array.isArray(message) ? message : [message];

        req.session.flashMessages[type].push(...newMessages);
    };

    res.locals.flashMessages = {
        success: req.flash('success'),
        error: req.flash('error')
    };

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
 */
app.use((req, res, next) => {
    res.status(404).render('errors/404', {
        title: 'Page Not Found'
    });
});

/**
 * Global error handler
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
