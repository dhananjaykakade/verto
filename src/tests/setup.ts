
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_PRETTY = 'false';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Any global setup can go here
});

afterAll(async () => {
  // Any global cleanup can go here
});
