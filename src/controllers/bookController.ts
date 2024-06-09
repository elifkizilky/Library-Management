import { Request, Response } from 'express';
import { Database } from '../dataSource';
import { Book } from '../entities/Book';
import { LoanRecord } from '../entities/LoanRecord';
import logger from '../logger'; 
import { Not, IsNull } from "typeorm";
import { User } from '../entities/User';

export const createBook = async (req: Request, res: Response) => {
    const { name } = req.body;
    
    try {
        const bookRepository = Database.getRepository(Book);
        const newBook = bookRepository.create({ name });
        
        await bookRepository.save(newBook);
        const response = {
            name: newBook.name,
        };
        res.status(201).json(response);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('duplicate key value violates unique constraint')) {
                logger.warn(`Duplicate name entry: ${name}`);
                res.status(409).json({ message: "A book with the same name already exists.", error: error.message });
            } else {
                logger.error(`Error creating new book: ${error.message}`);
                res.status(500).json({ message: "Error creating new book", error: error.message });
            }
            
        }
    }
};


export const getAllBooks = async (req: Request, res: Response) => {
    try {
        
        const bookRepository = Database.getRepository(Book);
        const books = await bookRepository.find({
            select: ['id', 'name']
        });
        logger.info(`Book list fetched: ${books.length} books found.`);
        res.status(200).json(books);
    } catch (error) {
        logger.error(`Error fetching books: ${error instanceof Error ? error.message : "Unknown error"}`);
        res.status(500).json({ message: "Error fetching books", error: error instanceof Error ? error.message : "Unknown error" });
    }
};

export const getBook = async (req: Request, res: Response) => {
    try {
        const bookId = parseInt(req.params.bookId);
        const bookRepository = Database.getRepository(Book);
        
        const book = await bookRepository.findOneBy({ id: bookId });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({
            id: book.id,
            name: book.name,
            score: book.averageScore
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching book", error: error instanceof Error ? error.message : "Unknown error" });
    }
   
};


export const borrowBook = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const bookId = parseInt(req.params.bookId);

    const userRepository = Database.getRepository(User);
    const bookRepository = Database.getRepository(Book);
    const borrowRepository = Database.getRepository(LoanRecord);

    try {
        const user = await userRepository.findOneBy({ id: userId });
        const book = await bookRepository.findOneBy({ id: bookId });

        if (!user && !book) {
            return res.status(404).send('User and Book not found');
        } else if (!user) {
            return res.status(404).send('User not found');
        } else if (!book) {
            return res.status(404).send('Book not found');
        }

        const activeBorrow = await borrowRepository.findOne({
            where: {
                book: { id: bookId },
                returnedDate: IsNull()
            }
        });
    
        const userBorrow = await borrowRepository.findOne({
            where: {
                user: { id: userId },
                book: { id: bookId },
                returnedDate: IsNull()
            }
        });
        
        if (userBorrow){
            return res.status(403).json({ message: 'User already borrowed this book' });
        }

        if (activeBorrow) {
            return res.status(403).json({ message: 'This book is currently borrowed by another user' });
        }

        const newBorrow = borrowRepository.create({
            user: user,
            book: book,
            borrowedDate: new Date()
        });

        await borrowRepository.save(newBorrow);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error borrowing book", error: error instanceof Error ? error.message : "Unknown error" });
    }
};


export const returnBook = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const bookId = parseInt(req.params.bookId);
    const { score } = req.body;

    const loanRepository = Database.getRepository(LoanRecord);
    const userRepository = Database.getRepository(User);
    const bookRepository = Database.getRepository(Book);

    try {
        
        const [user, book] = await Promise.all([
            userRepository.findOneBy({ id: userId }),
            bookRepository.findOneBy({ id: bookId })
        ]);

        if (!user && !book) {
            return res.status(404).json({ message: 'User and Book not found' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
    
        const loanRecord = await loanRepository.findOne({
            where: {
                user: { id: userId },
                book: { id: bookId },
                returnedDate: IsNull()
            }
        });

      
        if (!loanRecord) {
            return res.status(404).json({ message: "No active borrow found for this book and user." });
        }

        loanRecord.returnedDate = new Date();
        loanRecord.score = score;

        await loanRepository.save(loanRecord);

        // Update the average score for the book
        const borrowsWithScore = await loanRepository.find({
            where: {
                book: { id: bookId },
                score: Not(IsNull())
            },
            select: ['score']
        });

        const scores = borrowsWithScore.map(b => b.score as number);
        const averageScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : book.averageScore;
        book.averageScore = parseFloat(averageScore.toFixed(2));        
        await bookRepository.save(book);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error returning the book", error: error instanceof Error ? error.message : "Unknown error" });
    }
};
