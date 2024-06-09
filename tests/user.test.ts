import request from 'supertest';
import app from '../src/app';
import { Database } from '../src/dataSource';


let userId: number;

beforeAll(async () => {
  // Create a user for testing
  const userRes = await request(app)
    .post('/users')
    .send({ name: 'Test User' });
  userId = userRes.body.id;
});

afterAll(async () => {
  // Clean up created data
  await request(app).delete(`/users/${userId}`);

});

describe('POST /users', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'John' });

    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('John');
    expect(res.body).toHaveProperty('id');
  });

  it('should give a duplicate error', async () => {
    await request(app).post('/users').send({ name: 'John' }); // First insert
    const res2 = await request(app).post('/users').send({ name: 'John' }); // Duplicate insert

    expect(res2.statusCode).toEqual(409);
  });

  it('should say it is a bad request when name is too short', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'J' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(expect.objectContaining({
      message: "Name must be at least 3 characters long."
    }));
  });

  it('should say it is a bad request when name is empty', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: '' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(expect.objectContaining({
      message: "Name is required."
    }));
  });
});

describe('GET /users', () => {
  it('should return a list of users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });
});

describe('GET /users/:userId', () => {
  it('should return a user and their borrowing history', async () => {
    const res = await request(app).get(`/users/${userId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('books');
    expect(res.body.books).toHaveProperty('past');
    expect(res.body.books).toHaveProperty('present');
  });

  it('should return 404 if the user does not exist', async () => {
    const res = await request(app).get('/users/999');
    expect(res.statusCode).toEqual(404);
  });
});

describe('User Management', () => {
  it('should update the user name', async () => {
    const res = await request(app)
      .patch(`/users/${userId}`)
      .send({ name: 'New User Name' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User updated successfully');
  });

  it('should delete a user', async () => {
    const newUserRes = await request(app)
      .post('/users')
      .send({ name: 'User to Delete' });
    const newUserId = newUserRes.body.id;

    const res = await request(app)
      .delete(`/users/${newUserId}`);
    expect(res.statusCode).toEqual(204);
  });
});
