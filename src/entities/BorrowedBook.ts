import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Book } from "./Book";

@Entity()
export class BorrowedBook {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.borrowedBooks)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Book, book => book.borrowedBooks)
    @JoinColumn({ name: 'book_id' })
    book: Book;

    @Column()
    borrowedDate: Date;

    @Column({ nullable: true })
    returnedDate: Date;

    @Column({ type: "int", nullable: true })
    score: number; 
}