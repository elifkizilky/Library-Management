import express from 'express';
import * as userController from '../controllers/userController';
import { validateCreateUser } from '../middleware/validateUser';
import { param } from 'express-validator';
import { validate } from '../middleware/validate';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Adds a new user to the system with just their name.
 *     tags:
 *       - Users
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
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       409:
 *         description: A user with the same name already exists
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
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Error occurred while fetching users
 */
router.get('/users', userController.getAllUsers);

const getUserValidationRules = [
    param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer')
];

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get a user and their borrow history
 *     description: Retrieve a user's details along with their past and present borrowed books.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's ID
 *     responses:
 *       200:
 *         description: A user object along with past and present borrowed books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 books:
 *                   type: object
 *                   properties:
 *                     past:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           userScore:
 *                             type: integer
 *                     present:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Error occurred while fetching user
 */

router.get('/users/:userId', getUserValidationRules, validate, userController.getUser);

export default router;
