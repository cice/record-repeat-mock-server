import { server } from './server';
import { Client } from './client';
import { Express, NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import { IExpectation } from './common';

describe('integration test', () => {
  const port = 64032;

  let app: Express;
  let client: Client;
  let httpServer: Server;

  beforeEach((done) => {
    app = server();

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });

    httpServer = app.listen(port, () => {
      client = new Client(port);
      done();
    });
  });

  afterEach((done) => {
    httpServer.close(() => done());
    done();
  });

  it('should return 501 if no expectation exists', async () => {
    const response = await client.axios
      .get('/foofoo')
      .catch((error) => {
        return error.response;
      });

    expect(response.status).toEqual(501);
  });

  const methods: Array<IExpectation['method']> = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];

  for (const method of methods) {
    it(`should add and match simple expectation for ${method}`, async () => {
      await client.expectations.add({
        method: method,
        path: '/foo-bar',
        responses: [
          {status: 200, body: {some: 'ResponseData'}},
        ],
      });

      const response = await client.axios({
          method: method,
          url: '/foo-bar',
        })
        .catch((error) => {
          return error.response;
        });

      expect(response.status).toEqual(200);
      expect(response.data).toEqual({some: 'ResponseData'});
    });
  }
});
