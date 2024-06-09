import { Request, Response } from 'express';
import { Database } from '../dataSource';
import { LoanRecord } from '../entities/LoanRecord';
import { Not, IsNull } from "typeorm";
import { User } from '../entities/User';
import { Book } from '../entities/Book';


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


export const updateUserScore = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const bookId = parseInt(req.params.bookId);
    const { newScore } = req.body;

    const loanRepository = Database.getRepository(LoanRecord);
    const bookRepository = Database.getRepository(Book);

    try {
        const user = await loanRepository.findOneBy({ id: userId });
        const book = await bookRepository.findOneBy({ id: bookId });
        if (!user && !book) {
            return res.status(404).json({ message: 'User and Book not found' });
        } else if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        else if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const loanRecord = await loanRepository.findOne({
            where: {
                user: { id: userId },
                book: { id: bookId },
                returnedDate: Not(IsNull())
            }
        });

        if (!loanRecord) {
            return res.status(404).json({ message: "Borrow record not found." });
        }

        loanRecord.score = newScore;
        await loanRepository.save(loanRecord);

        // Recalculate the average score
        await updateAverageScore(bookId, loanRepository, bookRepository);
        res.status(200).json({ message: "Score updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating score", error: error instanceof Error ? error.message : "Unknown error" });
    }
};

async function updateAverageScore(bookId: number, loanRepository: any, bookRepository: any) {
    interface BorrowWithScore {
        score: number;
    }
    
    const borrowsWithScore = await loanRepository.find({
        where: {
            book: { id: bookId },
            score: Not(IsNull())
        },
        select: ['score']
    }) as BorrowWithScore[];
     
    const book = await bookRepository.findOneBy({ id: bookId });
    const scores = borrowsWithScore.map(b => b.score as number);
    const averageScore = scores.length ? parseFloat((scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(2)) : -1;
    book.averageScore = averageScore;
    await bookRepository.save(book);
}


export const deleteLoanRecord = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const bookId = parseInt(req.params.bookId);

    const loanRepository = Database.getRepository(LoanRecord);
    const bookRepository = Database.getRepository(Book);
    const userRepository = Database.getRepository(User);

    try {

        const user = await userRepository.findOneBy({ id: userId });
        const book = await bookRepository.findOneBy({ id: bookId });
        if (!user && !book) {
            return res.status(404).json({ message: 'User and Book not found' });
        }
        else if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        else if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const loanRecord = await loanRepository.findOne({
            where: {
                user: { id: userId },
                book: { id: bookId },
            }
        });

        if (!loanRecord) {
            return res.status(404).json({ message: "No active loan record found for this book and user." });
        }

        // Check if the record has a score before deletion
        const hadScore = loanRecord.score !== null;
        const result = await loanRepository.delete(loanRecord.id);
        if (result.affected === 0) {
            return res.status(404).json({ message: "Loan record not found" });
        }

        // Recalculate the average score if necessary
        if (hadScore) {
            await updateAverageScore(bookId, loanRepository, bookRepository);
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error deleting loan record", error: error instanceof Error ? error.message : "Unknown error" });
    }
};
