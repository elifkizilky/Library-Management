import { Request, Response } from 'express';
import { Database } from '../dataSource';
import { Book } from '../entities/Book';
import { LoanRecord } from '../entities/LoanRecord';
import logger from '../logger'; 
import { Like, IsNull } from "typeorm";
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = req.query.sort as keyof User || 'id';
    const order = req.query.order === 'ASC' ? 'ASC' : 'DESC'; // Only allow ASC or DESC
    const name = req.query.name as string;

    const skip = (page - 1) * limit;

    try {
        const bookRepository = Database.getRepository(Book);
        const [books, total] = await bookRepository.findAndCount({
            where: name ? { name: Like(`%${name}%`) } : {},
            order: { [sort]: order },
            take: limit,
            skip: skip
        });
        logger.info(`Book list fetched: ${books.length} books found out of ${total}.`);
        res.status(200).json(books);
    } catch (error) {
        if (error instanceof Error) {
        logger.error(`Error fetching books: ${error.message}`);
        res.status(500).json({ message: "Error fetching books", error: error.message });
        } else {
            res.status(500).json({ message: "Error fetching books", error: "Unknown error" });
        
        }
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


export const updateBook = async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.bookId);
    const { name } = req.body; // New name from the request

    const bookRepository = Database.getRepository(Book);

    try {
        const book = await bookRepository.findOneBy({ id: bookId });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        book.name = name;
        await bookRepository.save(book);
        res.status(200).json({ message: 'Book updated successfully', book });
    } catch (error) {
        res.status(500).json({ message: "Error updating book", error: error instanceof Error ? error.message : "Unknown error" });
    }
};


export const deleteBook = async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.bookId);

    const bookRepository = Database.getRepository(Book);
    const loanRecordRepository = Database.getRepository(LoanRecord);

    try {
         // Check for active loan records (book currently borrowed)
         const activeLoans = await loanRecordRepository.find({
            where: {
                book: { id: bookId },
                returnedDate: IsNull()
            }
        });

        if (activeLoans.length > 0) {
            // If there are active loans, prevent deletion and inform the requester
            return res.status(400).json({
                message: "Book cannot be deleted because it is currently borrowed."
            });
        }
        const result = await bookRepository.delete(bookId);
        if (result.affected === 0) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error deleting book", error: error instanceof Error ? error.message : "Unknown error" });
    }
};
