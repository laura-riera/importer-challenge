import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import * as path from 'path';

describe('ImporterController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should upload a valid CSV file and return a success summary', async () => {
    const filePath = path.join(__dirname, 'fixtures', 'valid.csv');

    const response = await request(app.getHttpServer())
      .post('/import/csv')
      .attach('file', filePath);

    const body = response.body as { summary: string; rows?: any[] };

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('summary');
    expect(body.summary).toMatch(/valid rows/);
  });

  it('should return 400 for invalid CSV file (wrong structure)', async () => {
    const filePath = path.join(__dirname, 'fixtures', 'invalid.csv');

    const response = await request(app.getHttpServer())
      .post('/import/csv')
      .attach('file', filePath);

    expect(response.status).toBe(400);
  });

  it('should return 400 if no file is uploaded', async () => {
    const response = await request(app.getHttpServer()).post('/import/csv');

    const body = response.body as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/File is required/);
  });

  it('should return imported emissions data from /import/data', async () => {
    const response = await request(app.getHttpServer()).get('/import/data');

    const body = response.body as any[];

    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });
});
