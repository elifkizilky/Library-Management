import request from 'supertest';
import app from '../src/app';
import { Database } from '../src/dataSource';

let userId: number;
let bookId: number;

beforeAll(async () => {

  // Create a user and a book for testing
  const userRes = await request(app)
    .post('/users')
    .send({ name: 'Test User' });
  userId = userRes.body.id;

  const bookRes = await request(app)
    .post('/books')
    .send({ name: 'Test Book' });
  bookId = bookRes.body.id;
});

afterAll(async () => {
  // Clean up created data
  await request(app).delete(`/users/${userId}`);
  await request(app).delete(`/books/${bookId}`);

});

describe('POST /users/:userId/borrow/:bookId', () => {
  it('should allow a user to borrow a book', async () => {
    const res = await request(app).post(`/users/${userId}/borrow/${bookId}`);
    expect(res.statusCode).toEqual(204);
  });

  it('should handle cases where the user or book does not exist', async () => {
    const res = await request(app).post('/users/999/borrow/999');
    expect(res.statusCode).toEqual(404);
  });

  it('should return an error if userId is not a valid integer', async () => {
    const res = await request(app).post('/users/not-a-number/borrow/1');
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContainEqual(expect.objectContaining({
      msg: 'User ID must be a positive integer'
    }));
  });

  it('should return an error if bookId is not a valid integer', async () => {
    const res = await request(app).post('/users/1/borrow/not-a-number');
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContainEqual(expect.objectContaining({
      msg: 'Book ID must be a positive integer'
    }));
  });

  it('should prevent borrowing if the book is already borrowed', async () => {
    await request(app).post(`/users/${userId}/borrow/${bookId}`);
    const res = await request(app).post(`/users/${userId}/borrow/${bookId}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toBe('This book is currently borrowed by another user');
  });
});

describe('POST /users/:userId/return/:bookId', () => {
  it('should return a book and record the score', async () => {
    const res = await request(app)
      .post(`/users/${userId}/return/${bookId}`)
      .send({ score: 9 });
    expect(res.statusCode).toEqual(204);
  });

  it('should handle invalid scores', async () => {
    const res = await request(app)
      .post(`/users/${userId}/return/${bookId}`)
      .send({ score: 11 });
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toContainEqual(expect.objectContaining({
      msg: 'Score must be an integer between 1 and 10'
    }));
  });
});

describe('Book Score Management', () => {
  it('should update the user score for a book', async () => {
    const res = await request(app)
      .patch(`/books/${bookId}/users/${userId}/score`)
      .send({ newScore: 7.5 });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Score updated successfully');
  });

  it('should return error if book or user not found', async () => {
    const res = await request(app)
      .patch('/books/999/users/999/score')
      .send({ newScore: 5 });
    expect(res.statusCode).toEqual(404);
  });
});

describe('Loan Record Deletion', () => {
  it('should delete a loan record for a specific user and book', async () => {
    const res = await request(app).delete(`/loan-records/users/${userId}/books/${bookId}`);
    expect(res.statusCode).toEqual(204);
  });

  it('should return 404 if no matching loan record exists', async () => {
    const res = await request(app).delete('/loan-records/users/999/books/999');
    expect(res.statusCode).toEqual(404);
  });
});
