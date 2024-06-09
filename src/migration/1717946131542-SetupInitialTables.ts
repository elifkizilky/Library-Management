import { MigrationInterface, QueryRunner } from "typeorm";

export class SetupInitialTables1717946131542 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // User Table
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(100) NOT NULL UNIQUE
            );
        `);

        // Book Table
        await queryRunner.query(`
            CREATE TABLE "book" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(255) NOT NULL UNIQUE
                "averageScore" FLOAT DEFAULT -1
            );
        `);

        // LoanRecord Table
        await queryRunner.query(`
            CREATE TABLE "loan_record" (
                "id" SERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL,
                "book_id" INTEGER NOT NULL,
                "borrowedDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "returnedDate" TIMESTAMP WITH TIME ZONE,
                "score" INTEGER,
                FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL,
                FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE SET NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "loan_record"`);
        await queryRunner.query(`DROP TABLE "book"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
