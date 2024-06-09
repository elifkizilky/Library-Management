import "reflect-metadata";
import express from 'express';
import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { AppDataSource } from './dataSource'; 
import userRoutes from './routes/userRoutes';
import bookRoutes from './routes/bookRoutes';
import borrowRoutes from './routes/borrowRoutes';
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(userRoutes);
app.use(bookRoutes);
app.use(borrowRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger docs available on http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization", error);
    process.exit(1);
  });

export default app;
