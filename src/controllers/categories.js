
import { body, validationResult } from 'express-validator';

import {
    getAllCategories,
    getCategoryDetails,
    createCategory,
    updateCategory,
    updateCategoryAssignments
} from '../models/categories.js';

import {
    getProjectsByCategoryId,
    getProjectDetails,
    getCategoriesByProjectId
} from '../models/projects.js';

// Validation rules for category forms
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required.')
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters.')
];

// Display all projects belonging to a category
const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;

        const category = await getCategoryDetails(categoryId);

        if (!category) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        const projects = await getProjectsByCategoryId(categoryId);

        res.render('category', {
            title: category.name,
            category,
            projects
        });
    } catch (error) {
        next(error);
    }
};

// Display the assign categories form
const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const project = await getProjectDetails(projectId);

        if (!project) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        const categories = await getAllCategories();
        const assignedCategories = await getCategoriesByProjectId(projectId);

        const assignedCategoryIds = assignedCategories.map(
            category => category.category_id
        );

        res.render('assign-categories', {
            title: 'Assign Categories',
            project,
            categories,
            assignedCategoryIds
        });
    } catch (error) {
        next(error);
    }
};

// Process category assignments
const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const project = await getProjectDetails(projectId);

        if (!project) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        let categoryIds = req.body.categories || [];

        if (!Array.isArray(categoryIds)) {
            categoryIds = [categoryIds];
        }

        const allCategories = await getAllCategories();

        const validCategoryIds = new Set(
            allCategories.map(category => String(category.category_id))
        );

        const selectedCategoryIds = [
            ...new Set(categoryIds.map(String))
        ];

        const invalidCategory = selectedCategoryIds.some(
            id => !/^\d+$/.test(id) || !validCategoryIds.has(id)
        );

        if (invalidCategory) {
            req.flash('error', 'Please select valid categories.');
            return res.redirect(`/assign-categories/${projectId}`);
        }

        await updateCategoryAssignments(
            projectId,
            selectedCategoryIds.map(Number)
        );

        req.flash('success', 'Project categories updated successfully!');

        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

// Display the new category form
const showNewCategoryForm = (req, res) => {
    res.render('category-form', {
        title: 'Add Category',
        heading: 'Add New Category',
        action: '/new-category',
        category: {}
    });
};

// Process the new category form
const processNewCategoryForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(error => error.msg));
            return res.redirect('/new-category');
        }

        const categoryId = await createCategory(req.body.name);

        req.flash('success', 'Category created successfully!');

        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        if (error.code === '23505') {
            req.flash('error', 'A category with that name already exists.');
            return res.redirect('/new-category');
        }

        next(error);
    }
};

// Display the edit category form
const showEditCategoryForm = async (req, res, next) => {
    try {
        const category = await getCategoryDetails(req.params.id);

        if (!category) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        res.render('category-form', {
            title: 'Edit Category',
            heading: 'Edit Category',
            action: `/edit-category/${category.category_id}`,
            category
        });
    } catch (error) {
        next(error);
    }
};

// Process category updates
const processEditCategoryForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(error => error.msg));
            return res.redirect(`/edit-category/${req.params.id}`);
        }

        const existingCategory = await getCategoryDetails(req.params.id);

        if (!existingCategory) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found'
            });
        }

        await updateCategory(req.params.id, req.body.name);

        req.flash('success', 'Category updated successfully!');

        res.redirect(`/category/${req.params.id}`);
    } catch (error) {
        if (error.code === '23505') {
            req.flash('error', 'A category with that name already exists.');
            return res.redirect(`/edit-category/${req.params.id}`);
        }

        next(error);
    }
};

export {
    categoryValidation,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm
};
