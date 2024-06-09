import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BorrowedBook } from "./BorrowedBook";

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    name: string;

    @OneToMany(() => BorrowedBook, borrowedBook => borrowedBook.book)
    borrowedBooks: BorrowedBook[];
}
