import { Request, Response } from 'express';
import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';
import logger from '../logger';  // Ensure the path is correct

export const createUser = async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
        const userRepository = AppDataSource.getRepository(User);
        const newUser = userRepository.create({ name });

        await userRepository.save(newUser);
        logger.info(`New user created: ${newUser.id}`);
        res.status(201).send(newUser);
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
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({
            select: ['id', 'name']
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error instanceof Error ? error.message : "Unknown error" });
    }
};
