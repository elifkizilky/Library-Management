import { DataSource } from "typeorm";
import dotenv from 'dotenv';

dotenv.config();
 
console.log(__dirname)
export const Database = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
        __dirname + (process.env.NODE_ENV === "development" ? "/entities/*.ts" : "/entities/*.js")
    ],
    migrations: [
        __dirname + (process.env.NODE_ENV === "development" ? '/migration/*.ts' : "/migration/*.js")
    ],
    synchronize: process.env.DB_SYNCHRONIZE === "true", //false in production
    logging: process.env.DB_LOGGING === "true",
    migrationsRun: true,
});

const connectWithRetry = () => {
    Database.initialize()
        .then(() => {
            console.log("Data source has been initialized!");
        })
        .catch(err => {
            console.error("Error during Data Source initialization:", err);
            setTimeout(connectWithRetry, 15000); // Retry after 5 seconds
        });
};

connectWithRetry();
