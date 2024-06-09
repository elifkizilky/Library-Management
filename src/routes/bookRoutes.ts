import express from 'express';
import { param } from 'express-validator';
import { createBook, getAllBooks, getBook } from '../controllers/bookController';
import { validateBook } from '../middleware/validateBook';
import { validate } from '../middleware/validate';

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
 *     summary: Retrieve a list of books
 *     description: Returns a list of books in the library.
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Error fetching the book list
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the book.
 *         name:
 *           type: string
 *           description: The name of the book.
 *           example: Neuromancer
 *         averageScore:
 *           type: number
 *           description: The average score of the book.
 *           example: 8.5
 *           nullable: true
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

export default router;
