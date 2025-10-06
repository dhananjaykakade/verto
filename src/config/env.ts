import dotenv from 'dotenv';

dotenv.config();

export class Env {
  public readonly NODE_ENV = process.env.NODE_ENV ?? 'development';
  public readonly PORT = Number(process.env.PORT ?? 4000);
  public readonly DATABASE_URL = process.env.DATABASE_URL ?? '';
  public readonly LOG_PRETTY = (process.env.LOG_PRETTY ?? 'true') === 'true';

  // Add any other config helpers here.
}

export const env = new Env();
