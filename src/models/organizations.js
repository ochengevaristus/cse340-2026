
import db from './db.js';

// Get all organizations
const getAllOrganizations = async () => {
    const query = `
        SELECT
            organization_id,
            name,
            description,
            contact_email,
            logo_filename
        FROM public.organization
        ORDER BY name ASC;
    `;

    const result = await db.query(query);
    return result.rows;
};

// Get one organization by ID
const getOrganizationDetails = async (organizationId) => {
    const query = `
        SELECT
            organization_id,
            name,
            description,
            contact_email,
            logo_filename
        FROM public.organization
        WHERE organization_id = $1;
    `;

    const result = await db.query(query, [organizationId]);
    return result.rows[0];
};

// Create a new organization
const createOrganization = async (
    name,
    description,
    contactEmail,
    logoFilename
) => {
    const query = `
        INSERT INTO public.organization (
            name,
            description,
            contact_email,
            logo_filename
        )
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id;
    `;

    const result = await db.query(query, [
        name,
        description,
        contactEmail,
        logoFilename
    ]);

    return result.rows[0].organization_id;
};

// Update an existing organization
const updateOrganization = async (
    organizationId,
    name,
    description,
    contactEmail,
    logoFilename
) => {
    const query = `
        UPDATE public.organization
        SET
            name = $1,
            description = $2,
            contact_email = $3,
            logo_filename = $4
        WHERE organization_id = $5
        RETURNING organization_id;
    `;

    const result = await db.query(query, [
        name,
        description,
        contactEmail,
        logoFilename,
        organizationId
    ]);

    return result.rows[0];
};

export {
    getAllOrganizations,
    getOrganizationDetails,
    createOrganization,
    updateOrganization
};
