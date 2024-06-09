import { Request, Response } from 'express';
import { Database } from '../dataSource';
import { User } from '../entities/User';
import logger from '../logger'; 
import { Like } from "typeorm";

export const createUser = async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
        const userRepository = Database.getRepository(User);
        const newUser = userRepository.create({ name });

        await userRepository.save(newUser);
        logger.info(`New user created: ${newUser.id}`);
        const response = {
            name: newUser.name,
        };
        res.status(201).send(response);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('duplicate key value violates unique constraint')) {
                logger.warn(`Duplicate name entry: ${name}`);
                res.status(409).json({ message: "A user with the same name already exists.", error: error.message });
            } else {
                logger.error(`Error creating new user: ${error.message}`);
                res.status(500).json({ message: "Error creating new user", error: error.message });
            }
        } else {
            logger.error('Unknown error occurred');
            res.status(500).json({ message: "Unknown error occurred" });
        }
    }
};


export const getAllUsers = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = req.query.sort as keyof User || 'id';
    const order = req.query.order === 'ASC' ? 'ASC' : 'DESC'; // Only allow ASC or DESC
    const name = req.query.name as string;

    const skip = (page - 1) * limit;

    try {
        const userRepository = Database.getRepository(User);
        const [users, total] = await userRepository.findAndCount({
            where: name ? { name: Like(`%${name}%`) } : {},
            order: { [sort]: order },
            take: limit,
            skip
        });
        res.status(200).json(users);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching users: ${error.message}`);
            res.status(500).json({ message: "Error fetching users", error: error.message });
        } else {
            res.status(500).json({ message: "Unkown error fetching users" });
        }
        
    }
};



export const getUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const userRepository = Database.getRepository(User);

    const user = await userRepository.findOne({
        where: { id: userId },
        relations: ["borrowedBooks", "borrowedBooks.book"]
    });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    interface BookInfo {
        name: string;
        userScore?: number;  // Optional since it might not exist for present books
    }
    

    const formattedBooks = user.borrowedBooks.reduce<{ past: BookInfo[], present: BookInfo[] }>((acc, borrow) => {
        const bookInfo: BookInfo = {
            name: borrow.book.name,
            userScore: borrow.score
        };
    
        if (borrow.returnedDate) {
            acc.past.push(bookInfo);
        } else {
            acc.present.push({ name: bookInfo.name });
        }
        return acc;
    }, { past: [], present: [] });
    

    const response = {
        id: user.id,
        name: user.name,
        books: formattedBooks
    };

    logger.info(`User details fetched: ${response.id}`);
    res.status(200).json(response);
};

export const updateUser = async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = parseInt(req.params.userId);

    const userRepository = Database.getRepository(User);
    try {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name;
        await userRepository.save(user);
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        if (error instanceof Error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
        } else {
            res.status(500).json({ message: "Unknown error occurred" });
        }
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);

    const userRepository = Database.getRepository(User);
    try {
        const result = await userRepository.delete(userId);
        if (result.affected === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error deleting user", error: error.message });
        } else {
            res.status(500).json({ message: "Unknown error occurred" });
        }
    }
};
