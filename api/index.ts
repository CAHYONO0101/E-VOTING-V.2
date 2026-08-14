import { app } from '../expressApp';

export default function handler(req: any, res: any) {
  return app(req, res);
}

export { app };

