const DEFAULT_TIMEOUT = 5000;
const timeout = process.env.TEST_TIMEOUT
  ? parseInt(process.env.TEST_TIMEOUT, 10)
  : DEFAULT_TIMEOUT;

jest.setTimeout(timeout);
