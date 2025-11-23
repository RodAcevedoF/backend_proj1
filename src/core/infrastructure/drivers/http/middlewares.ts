import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { generalRateLimiter } from './rateLimit';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';

export const loadMiddlewares = (app: Express) => {
	// Security headers
	app.use(helmet());

	// CORS (customize origin in production)
	app.use(
		cors({
			origin: process.env.FRONTEND_URL, // adjust for production
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization'],
		}),
	);

	// Logging
	if (process.env.NODE_ENV === 'development') {
		app.use(morgan('dev'));
	} else {
		app.use(morgan('combined'));
	}

	// Parsers
	app.use(json());
	app.use(urlencoded({ extended: true }));
	app.use(cookieParser());

	// Rate limiter
	app.use(generalRateLimiter);
};

export default loadMiddlewares;
