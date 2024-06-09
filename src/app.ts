import "reflect-metadata";
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { Database } from './dataSource'; 
import userRoutes from './routes/userRoutes';
import bookRoutes from './routes/bookRoutes';
import loanRoutes from './routes/loanRoutes';
import express, { Request, Response, NextFunction } from 'express';
import logger from './logger';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(userRoutes);
app.use(bookRoutes);
app.use(loanRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); 
  const status = err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred!';
  logger.error(`Error: ${message}`);

  res.status(status).json({
      error: message,
      details: err.details || null
  });
});

 
let server: any;
Database.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger docs available on http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization", error);
    process.exit(1);
  });


export default app;
export { server, Database };

