import { server, Database } from './app';

beforeAll(async () => {
  if (!Database.isInitialized) {
    await Database.initialize();
  }
});

afterAll(async () => {
  if (Database.isInitialized) {
    await Database.destroy();
  }
  if (server) {
    server.close();
  }
});
