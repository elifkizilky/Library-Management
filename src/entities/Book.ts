import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { LoanRecord } from "./LoanRecord";

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true  
    })
    name: string;

    @Column({ type: "float", nullable: true, default: -1 })
    averageScore: number;

    @OneToMany(() => LoanRecord, loanRecord => loanRecord.book)
    borrowedBooks: LoanRecord[];
}
