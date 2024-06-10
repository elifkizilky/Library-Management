import express from 'express';
import * as userController from '../controllers/userController';
import { validateCreateUser } from '../middleware/validateUser';
import { param, body } from 'express-validator';
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
 *     summary: Retrieve a paginated list of users
 *     description: Returns a paginated list of users with options for sorting and filtering by name.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number of the results to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: 'id'
 *         description: The field to sort the results by.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: 'ASC'
 *         description: The ordering of the results, either ascending or descending.
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by user name using a partial match search.
 *     responses:
 *       200:
 *         description: A paginated list of users.
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/User'
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
 *         name:
 *           type: string
 *           description: The user's name.
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

const updateUserValidationRules = [
    param('userId').isNumeric().withMessage('User ID must be a valid number'),
    body('name').notEmpty().withMessage('Name must not be empty')
];

/**
 * @swagger
 * /users/{userId}:
 *   patch:
 *     summary: Update a user's name
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to update
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
 *                 example: 'Updated Name'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/users/:userId', updateUserValidationRules ,validateCreateUser, userController.updateUser);
 
const deleteUserValidationRules =  [
    param('userId').isNumeric().withMessage('User ID must be a valid number')
]
/**
 * @swagger
 * /users/{userId}: 
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to delete
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       400:
 *         description: Validation error, data provided is invalid.
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/users/:userId', deleteUserValidationRules , validate, userController.deleteUser);

export default router;
