import { Request, Response } from 'express';
import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';
import { Book } from '../entities/Book';
import { BorrowedBook } from '../entities/BorrowedBook';
import { IsNull, Not } from 'typeorm';


export const borrowBook = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const bookId = parseInt(req.params.bookId);

    const userRepository = AppDataSource.getRepository(User);
    const bookRepository = AppDataSource.getRepository(Book);
    const borrowRepository = AppDataSource.getRepository(BorrowedBook);

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

    const borrowRepository = AppDataSource.getRepository(BorrowedBook);
    const userRepository = AppDataSource.getRepository(User);
    const bookRepository = AppDataSource.getRepository(Book);

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
    
        const borrowedBook = await borrowRepository.findOne({
            where: {
                user: { id: userId },
                book: { id: bookId },
                returnedDate: IsNull()
            }
        });

      
        if (!borrowedBook) {
            return res.status(404).json({ message: "No active borrow found for this book and user." });
        }

        borrowedBook.returnedDate = new Date();
        borrowedBook.score = score;

        await borrowRepository.save(borrowedBook);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error returning the book", error: error instanceof Error ? error.message : "Unknown error" });
    }
};

