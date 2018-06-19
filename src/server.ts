import express = require('express');
import { Express, Request, Response } from 'express';
import {
  IDeleteExpectation,
  IExpectation,
  IGetExpectation,
  IMockResponse,
  IPatchExpectation,
  IPostExpectation,
  IPutExpectation,
} from './common';
import { find, filter } from 'lodash';

export class Handler {
  readonly expectations: IExpectation[] = [];
  private _handlers: { [method: string]: (q: Request, r: Response) => void } = {
    GET: (q: Request, r: Response) => this.handleGet(q, r),
    POST: (q: Request, r: Response) => this.handlePost(q, r),
    PATCH: (q: Request, r: Response) => this.handlePatch(q, r),
    PUT: (q: Request, r: Response) => this.handlePut(q, r),
    DELETE: (q: Request, r: Response) => this.handleDelete(q, r),
  };

  constructor() {
  }

  matchPost(request: Request): IPostExpectation | undefined {
    return find(this.expectationsFor<IPostExpectation>('POST'), (x: IPostExpectation) => {
      return x.path === request.path;
    });
  }

  handlePost(request: Request, response: Response) {
    const expectation = this.matchPost(request);
    this.trySendResponse(expectation, response);
  }

  matchGet(request: Request): IGetExpectation | undefined {
    return find(this.expectationsFor<IGetExpectation>('GET'), (x: IGetExpectation) => {
      return x.path === request.path;
    });
  }

  handleGet(request: Request, response: Response) {
    const expectation = this.matchGet(request);
    this.trySendResponse(expectation, response);
  }

  matchPatch(request: Request): IPatchExpectation | undefined {
    return find(this.expectationsFor<IPatchExpectation>('PATCH'), (x: IPatchExpectation) => {
      return x.path === request.path;
    });
  }

  handlePatch(request: Request, response: Response) {
    const expectation = this.matchPatch(request);
    this.trySendResponse(expectation, response);
  }

  matchPut(request: Request): IPutExpectation | undefined {
    return find(this.expectationsFor<IPutExpectation>('PUT'), (x: IPutExpectation) => {
      return x.path === request.path;
    });
  }

  handlePut(request: Request, response: Response) {
    const expectation = this.matchPut(request);
    this.trySendResponse(expectation, response);
  }

  matchDelete(request: Request): IDeleteExpectation | undefined {
    return find(this.expectationsFor<IDeleteExpectation>('DELETE'), (x: IDeleteExpectation) => {
      return x.path === request.path;
    });
  }

  handleDelete(request: Request, response: Response) {
    const expectation = this.matchDelete(request);
    this.trySendResponse(expectation, response);
  }

  private trySendResponse(expectation: IExpectation | undefined, response: Response) {
    if (expectation && expectation.responses && expectation.responses.length) {
      this.sendResponse(response, expectation.responses[0]);
    } else {
      this.notImplemented(response);
    }
  }

  handle(request: Request, response: Response) {
    this._handlers[request.method](request, response);
  }

  notImplemented(res: Response) {
    res.status(501);
    res.send({});
  }

  private expectationsFor<T extends IExpectation>(method: IExpectation['method']) {
    return filter(this.expectations, (x) => x.method === method) as T[];
  }

  private sendResponse(response: Response, mockResponse: IMockResponse) {
    response.status(mockResponse.status);
    response.send(mockResponse.body);
  }
}

export const server: () => Express = () => {
  const app = express();

  app.use(express.json());

  const handler = new Handler();

  app.post('/__expectations', (req: Request, res: Response) => {
    handler.expectations.push(req.body);
    res.status(201);
    res.send({});
  });

  app.all(/.*/, (req: Request, res: Response) => {
    handler.handle(req, res);
  });

  return app;
};
