import express from 'express';
import { borrowBook, returnBook, deleteLoanRecord } from '../controllers/loanController';
import { param, body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = express.Router();

const borrowValidationRules = [
    param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
    param('bookId').isInt({ min: 1 }).withMessage('Book ID must be a positive integer')
];
 
/**
 * @swagger
 * /users/{userId}/borrow/{bookId}:
 *   post:
 *     summary: Borrow a book
 *     description: Allows a user to borrow a book by specifying user and book IDs.
 *     tags: [Borrow a Book]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book
 *     responses:
 *       204:
 *         description: Book borrowed successfully
 *       404:
 *         description: User or book not found
 *       403:
 *         description: Book is currently borrowed by another user
 *       500:
 *         description: Server error
 * components:
 *   schemas:
 *     LoanRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The borrow event ID.
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: The ID of the user borrowing the book.
 *           example: 2
 *         book_id:
 *           type: integer
 *           description: The ID of the book being borrowed.
 *           example: 1
 *         borrowed_date:
 *           type: string
 *           format: date-time
 *           description: The date the book was borrowed.
 *           example: 2021-01-01T00:00:00.000Z
 *         returned_date:
 *           type: string
 *           format: date-time
 *           description: The date the book was returned.
 *           example: 2021-01-01T00:00:00.000Z
 *         score:
 *           type: integer
 *           description: The score given to the book by the user.
 *           example: 10
 */

router.post('/users/:userId/borrow/:bookId', borrowValidationRules, validate, borrowBook);


const returnBookValidationRules = [
    param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
    param('bookId').isInt({ min: 1 }).withMessage('Book ID must be a positive integer'),
    body('score').toInt().isInt({ min: 1, max: 10 }).withMessage('Score must be an integer between 1 and 10')
];


/**
 * @swagger
 * /users/{userId}/return/{bookId}:
 *   post:
 *     tags:
 *       - Return a Book
 *     summary: Return a borrowed book
 *     description: Allows a user to return a book they have borrowed and optionally rate the book.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user returning the book.
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book being returned.
 *     requestBody:
 *       required: true
 *       description: The score rating for the book between 1 and 10.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: integer
 *                 example: 10
 *         schema:
 *           type: object
 *           required:
 *             - score
 *           properties:
 *             score:
 *               type: integer
 *               minimum: 1
 *               maximum: 10
 *               description: Score rating from 1 to 10.
 *     responses:
 *       204:
 *         description: Book returned successfully, no content in the response.
 *       400:
 *         description: Validation error, data provided is invalid.
 *       404:
 *         description: User or book not found, or book not currently borrowed.
 *       500:
 *         description: Internal Server Error
 *   components:
 *   schemas:
 *     LoanRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The borrow event ID.
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: The ID of the user borrowing the book.
 *           example: 2
 *         book_id:
 *           type: integer
 *           description: The ID of the book being borrowed.
 *           example: 1
 *         borrowed_date:
 *           type: string
 *           format: date-time
 *           description: The date the book was borrowed.
 *           example: 2021-01-01T00:00:00.000Z
 *         returned_date:
 *           type: string
 *           format: date-time
 *           description: The date the book was returned.
 *           example: 2021-01-01T00:00:00.000Z
 *         score:
 *           type: integer
 *           description: The score given to the book by the user.
 *           example: 10
 */

router.post('/users/:userId/return/:bookId',  returnBookValidationRules,validate, returnBook);

const deleteLoanRecordValidationRules = [
    param('userId').isNumeric().withMessage('User ID must be a valid number'),
    param('bookId').isNumeric().withMessage('Book ID must be a valid number')
];

/**
 * @swagger
 * /loan-records/users/{userId}/books/{bookId}:
 *   delete:
 *     summary: Delete a loan record for a specific user and book
 *     description: Deletes a loan record based on the user ID and book ID provided. This endpoint should be used to remove records where a book has been returned and scored.
 *     tags:
 *       - Delete Record
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user associated with the loan record
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book associated with the loan record
 *     responses:
 *       204:
 *         description: Loan record deleted successfully
 *       404:
 *         description: No active loan record found for this book and user
 *       500:
 *         description: Internal server error due to an unexpected issue
 */
router.delete('/loan-records/users/:userId/books/:bookId', deleteLoanRecordValidationRules , deleteLoanRecord);



export default router;
