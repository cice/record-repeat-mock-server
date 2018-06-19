import axios, { AxiosInstance, AxiosPromise } from 'axios';
import { IGetExpectation, IExpectation } from './common';

export class Client {
  readonly host: string;
  readonly expectations: Expectations;
  readonly axios: AxiosInstance;

  constructor(private _port: number) {
    this.host = `http://localhost:${_port}`;
    this.expectations = new Expectations(this);
    this.axios = axios.create({baseURL: this.host});
  }
}

export class Expectations {
  private _path = '/__expectations';

  constructor(private _client: Client) {
  }

  add(expectation: IExpectation): AxiosPromise<any> {
    return this._client.axios
      .post(this._path, expectation);
  }
}
