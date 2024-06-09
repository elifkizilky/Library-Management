import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Book } from "./Book";

@Entity()
export class LoanRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.loanRecords, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Book, book => book.loanRecords, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'book_id' })
    book: Book;

    @Column()
    borrowedDate: Date;

    @Column({ nullable: true })
    returnedDate: Date;

    @Column({ type: "int", nullable: true })
    score: number; 
}