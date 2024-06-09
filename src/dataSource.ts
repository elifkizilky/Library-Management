import { DataSource } from "typeorm";
import dotenv from 'dotenv';

dotenv.config();
 
console.log(__dirname)
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
        __dirname + (process.env.NODE_ENV === "development" ? "/entities/*.ts" : "/entities/**/*.js")
    ],
    synchronize: process.env.DB_SYNCHRONIZE === "true", //false in production
    logging: process.env.DB_LOGGING === "true"
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data source has been initialized!");
    })
    .catch(err => {
        console.error("Error during Data Source initialization:", err);
    });
