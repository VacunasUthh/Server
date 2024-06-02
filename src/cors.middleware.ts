import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Establece los encabezados CORS
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Cambia esto según tu configuración
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Responde con un estado 204 No Content a las solicitudes OPTIONS
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    // Pasa la solicitud al siguiente middleware o controlador
    next();
  }
}
