export interface IExpectation {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  responses?: IMockResponse[];
  headers?: { [key: string]: string };
}

export interface IMockResponse {
  status: number;
  body?: object;
}

export interface IGetExpectation extends IExpectation {
  method: 'GET';
}

export interface IPostExpectation extends IExpectation {
  method: 'POST';
}

export interface IDeleteExpectation extends IExpectation {
  method: 'DELETE';
}

export interface IPutExpectation extends IExpectation {
  method: 'PUT';
}

export interface IPatchExpectation extends IExpectation {
  method: 'PATCH';
}
