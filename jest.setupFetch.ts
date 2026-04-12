// Configura fetch en el entorno de test para Node.js
import fetch, { Headers, Request, Response } from 'cross-fetch';

if (!(global as unknown as { fetch: unknown }).fetch) {
  (global as unknown as { fetch: typeof fetch }).fetch = fetch;
  (global as unknown as { Headers: typeof Headers }).Headers = Headers;
  (global as unknown as { Request: typeof Request }).Request = Request;
  (global as unknown as { Response: typeof Response }).Response = Response;
}
