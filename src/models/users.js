
import db from './db.js';
import bcrypt from 'bcrypt';

// Create a new user and assign the default user role.
const createUser = async (name, email, passwordHash) => {
    const query = `
        INSERT INTO public.users (
            name,
            email,
            password_hash,
            role_id
        )
        VALUES (
            $1,
            $2,
            $3,
            (SELECT role_id FROM public.roles WHERE role_name = 'user')
        )
        RETURNING user_id;
    `;

    const result = await db.query(query, [
        name,
        email,
        passwordHash
    ]);

    return result.rows[0].user_id;
};

// Find a user by email, including their role.
const findUserByEmail = async (email) => {
    const query = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            u.password_hash,
            u.role_id,
            r.role_name
        FROM public.users u
        JOIN public.roles r
            ON u.role_id = r.role_id
        WHERE LOWER(u.email) = LOWER($1);
    `;

    const result = await db.query(query, [email]);

    return result.rows[0];
};

// Compare a submitted password with its stored hash.
const verifyPassword = async (password, passwordHash) => {
    return await bcrypt.compare(password, passwordHash);
};

// Authenticate a user using their email and password.
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user) {
        return null;
    }

    const passwordMatches = await verifyPassword(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        return null;
    }

    // Never return the password hash to the session or controller.
    const { password_hash, ...authenticatedUser } = user;

    return authenticatedUser;
};

export {
    createUser,
    findUserByEmail,
    verifyPassword,
    authenticateUser
};
