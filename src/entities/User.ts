import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { LoanRecord } from "./LoanRecord";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    name: string

    @OneToMany(() => LoanRecord, loanRecord => loanRecord.user)
    loanRecords: LoanRecord[]
   
}
