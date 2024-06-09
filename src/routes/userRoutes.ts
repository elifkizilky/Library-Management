import express from 'express';
import * as userController from '../controllers/userController';
import { validateCreateUser } from '../middleware/validateUser';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Adds a new user to the system with just their name.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Esin Öner
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user ID
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: The name of the user
 *                   example: Esin Öner
 *       400:
 *         description: Invalid input
 *       409:
 *         description: A user with the same name already exists.
 *       500:
 *         description: Server error
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID.
 *           example: 1
 *         name:
 *           type: string
 *           description: The name of the user.
 *           example: Esin Öner
 */
router.post('/users', validateCreateUser, userController.createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Retrieve a list of users with their IDs and names.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The user ID.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the user.
 *                     example: John Doe
 *       500:
 *         description: Error occurred while fetching users.
 */
router.get('/users', userController.getAllUsers);

export default router;
