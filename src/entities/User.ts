import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { BorrowedBook } from "./BorrowedBook";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    name: string

    @OneToMany(() => BorrowedBook, borrowedBook => borrowedBook.user)
    borrowedBooks: BorrowedBook[]
   
}
