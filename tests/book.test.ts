import request from 'supertest';
import app from '../src/app';
import { Database } from '../src/dataSource';

describe('Books API', () => {
  let bookId : number;

  beforeEach(async () => {
   
    // setup test data before each test
    const res = await request(app)
      .post('/books')
      .send({ name: 'Initial Book' });
    bookId = res.body.id;
  });

  afterEach(async () => {
    // cleanup test data after each test
    await request(app).delete(`/books/${bookId}`);
   
  });

  describe('POST /books', () => {
    it('should validate that name is required', async () => {
      const res = await request(app)
        .post('/books')
        .send({ name: '' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toContainEqual(expect.objectContaining({
        msg: 'Name is required'
      }));
    });

    it('should validate that name is at least 3 characters long', async () => {
      const res = await request(app)
        .post('/books')
        .send({ name: 'No' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toContainEqual(expect.objectContaining({
        msg: 'Name must be at least 3 characters long'
      }));
    });

    it('should create a new book when valid name is provided', async () => {
      const res = await request(app)
        .post('/books')
        .send({ name: 'Neuromancer' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toEqual('Neuromancer');
    });
  });

  describe('GET /books', () => {
    it('should return a list of books', async () => {
      const res = await request(app).get('/books');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });

    it('should handle errors', async () => {
      // Simulate an error scenario by mocking the database
      jest.spyOn(Database, 'getRepository').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get('/books');
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /books/:bookId', () => {
    it('should return a book with its average score', async () => {
      const res = await request(app).get(`/books/${bookId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', bookId);
      expect(res.body).toHaveProperty('score');
    });

    it('should return 404 for a non-existing book', async () => {
      const res = await request(app).get('/books/999');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /books/:bookId', () => {
    it('should update the book name', async () => {
      const res = await request(app)
        .put(`/books/${bookId}`)
        .send({ name: 'New Name' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Book updated successfully');
    });

    it('should return 404 if book not found', async () => {
      const res = await request(app)
        .put('/books/999')
        .send({ name: 'New Name' });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /books/:bookId', () => {
    it('should delete the book', async () => {
      const res = await request(app)
        .delete(`/books/${bookId}`);
      expect(res.statusCode).toEqual(204);
    });

    it('should return 404 if book not found', async () => {
      const res = await request(app)
        .delete('/books/999');
      expect(res.statusCode).toEqual(404);
    });
  });
});
