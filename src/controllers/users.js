
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

import {
    createUser,
    authenticateUser,
    getAllUsers
} from '../models/users.js';

// Registration form validation
const registrationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.')
        .isLength({ max: 100 })
        .withMessage('Name must not exceed 100 characters.'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required.')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters.'),

    body('password')
        .notEmpty()
        .withMessage('Password is required.')
        .isLength({ min: 7 })
        .withMessage('Password must contain at least 7 characters.')
];

// Display registration form
const showUserRegistrationForm = (req, res) => {
    res.render('register', {
        title: 'Register'
    });
};

// Process registration form
const processUserRegistrationForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash(
                'error',
                errors.array().map(error => error.msg)
            );

            return res.redirect('/register');
        }

        const { name, email, password } = req.body;

        // Hash the password using 10 salt rounds.
        const passwordHash = await bcrypt.hash(password, 10);

        await createUser(name, email, passwordHash);

        req.flash(
            'success',
            'Your account has been created successfully. Please log in.'
        );

        return res.redirect('/login');
    } catch (error) {
        if (error.code === '23505') {
            req.flash(
                'error',
                'An account with that email address already exists.'
            );

            return res.redirect('/register');
        }

        next(error);
    }
};

// Display login form
const showLoginForm = (req, res) => {
    res.render('login', {
        title: 'Login'
    });
};

// Process login form
const processLoginForm = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.flash('error', 'Please enter your email and password.');
            return res.redirect('/login');
        }

        const user = await authenticateUser(email, password);

        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        // Regenerate the session to help prevent session fixation.
        req.session.regenerate((error) => {
            if (error) {
                return next(error);
            }

            req.session.user = user;

            req.session.save((saveError) => {
                if (saveError) {
                    return next(saveError);
                }

                req.flash(
                    'success',
                    `Welcome back, ${user.name}!`
                );

                return res.redirect('/dashboard');
            });
        });
    } catch (error) {
        next(error);
    }
};

// Require a logged-in user
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Please log in to access that page.');
        return res.redirect('/login');
    }

    next();
};

// Require a particular user role
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.session.user) {
            req.flash('error', 'Please log in first.');
            return res.redirect('/login');
        }

        if (req.session.user.role_name !== role) {
            req.flash(
                'error',
                'You do not have permission to access that page.'
            );

            return res.redirect('/');
        }

        next();
    };
};

// Display the user dashboard
const showDashboard = (req, res) => {
    res.render('dashboard', {
        title: 'My Dashboard',
        user: req.session.user
    });
};

// Display all registered users
const showUsersPage = async (req, res, next) => {
    try {
        const users = await getAllUsers();

        res.render('users', {
            title: 'Registered Users',
            users
        });
    } catch (error) {
        next(error);
    }
};

// Log out the current user
const processLogout = (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            return next(error);
        }

        res.clearCookie('connect.sid');
        return res.redirect('/');
    });
};

export {
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
};
