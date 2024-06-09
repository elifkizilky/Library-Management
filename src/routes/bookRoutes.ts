import express from 'express';
import { createBook } from '../controllers/bookController';
import { validateBook } from '../middleware/validateBook';

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

export default router;
