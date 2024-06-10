import express from 'express';
import { param, body } from 'express-validator';
import { createBook, getAllBooks, getBook } from '../controllers/bookController';
import { validateBook } from '../middleware/validateBook';
import { validate } from '../middleware/validate';
import { updateBook, deleteBook } from '../controllers/bookController';
import { updateUserScore } from '../controllers/loanController';


const router = express.Router();

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     description: Create a new book by providing a book name.
 *     tags: [Books]
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
 *                 description: The name of the book.
 *                 example: Neuromancer
 *     responses:
 *       201:
 *         description: Returns the created book.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid input
 *       409:
 *         description: A book with the same name already exists.
 *       500:
 *         description: Server error
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The book ID.
 *           example: 1
 *         name:
 *           type: string
 *           description: The name of the book.
 *           example: Neuromancer
 */
router.post('/books',validateBook, createBook);


/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve a paginated list of books
 *     description: Returns a paginated list of books with options for sorting and filtering by name.
 *     tags: [Books]
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
 *         description: Filter by book name using a partial match search.
 *     responses:
 *       200:
 *         description: A paginated list of books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 total:
 *                   type: integer
 *                   description: Total number of books.
 *                 page:
 *                   type: integer
 *                   description: Current page number.
 *                 last_page:
 *                   type: integer
 *                   description: Total number of pages.
 *       500:
 *         description: Server error
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The book ID.
 *         name:
 *           type: string
 *           description: The name of the book.
 */
router.get('/books', validate, getAllBooks);


const getBookValidationRules = [
    param('bookId').isInt({ min: 1 }).withMessage('Book ID must be a positive integer')
];


/**
 * @swagger
 * /books/{bookId}:
 *   get:
 *     summary: Get a specific book by ID with its average user score
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the book to retrieve
 *     responses:
 *       200:
 *         description: A single book with its average score
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 score:
 *                   type: string
 *                   description: Average score or -1 if not scored yet
 *       404:
 *         description: Book not found
 */
router.get('/books/:bookId', getBookValidationRules, validate, getBook);


const updateBookValidationRules =  [
    param('bookId').isNumeric().withMessage('Book ID must be a number'),
    body('name').isString().trim().notEmpty().withMessage('Name must be a non-empty string')
];
/**
 * @swagger
 * /books/{bookId}:
 *   put:
 *     summary: Update a book's name
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book to update
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
 *                 example: 'Updated Book Name'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book updated successfully"
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.put('/books/:bookId',updateBookValidationRules, validateBook, updateBook);

const deleteBookValidationRules =   [
    param('bookId').isNumeric().withMessage('Book ID must be a number')
];

/**
 * @swagger
 * /books/{bookId}:
 *   delete:
 *     summary: Delete a book
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book to delete
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.delete('/books/:bookId',deleteBookValidationRules, validate, deleteBook);


/**
 * @swagger
 * /books/{bookId}/users/{userId}/score:
 *   patch:
 *     summary: Update a user's score for a book
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book for which the score is being updated
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user updating the score
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newScore
 *             properties:
 *               newScore:
 *                 type: number
 *                 format: float
 *                 description: New score between 0 and 10
 *                 example: 8.5
 *     responses:
 *       200:
 *         description: Score updated successfully
 *       404:
 *         description: Book or User not found, or active borrow record not found
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
const updateUserScoreValidationRules =  [
    param('bookId').isNumeric().withMessage('Book ID must be a valid number'),
    param('userId').isNumeric().withMessage('User ID must be a valid number'),
    body('newScore').isFloat({ min: 0, max: 10 }).withMessage('Score must be between 0 and 10')
]

router.patch('/books/:bookId/users/:userId/score', updateUserScoreValidationRules, validate, updateUserScore);


export default router;
