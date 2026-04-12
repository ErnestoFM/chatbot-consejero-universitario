// Configura fetch en el entorno de test para Node.js
import fetch, { Headers, Request, Response } from 'cross-fetch';

if (!(global as any).fetch) {
  (global as any).fetch = fetch;
  (global as any).Headers = Headers;
  (global as any).Request = Request;
  (global as any).Response = Response;
}
