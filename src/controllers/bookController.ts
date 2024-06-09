import { Request, Response } from 'express';
import { AppDataSource } from '../dataSource';
import { Book } from '../entities/Book';
import logger from '../logger'; 

export const createBook = async (req: Request, res: Response) => {
    const { name } = req.body;
    
    try {
        const bookRepository = AppDataSource.getRepository(Book);
        const newBook = bookRepository.create({ name });
        
        await bookRepository.save(newBook);
        res.status(201).json(newBook);
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
