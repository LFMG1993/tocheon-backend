import {Hono} from 'hono';
import {cors} from 'hono/cors';
import suggestionRoutes from './routes/suggestion.routes';

const app = new Hono<{ Bindings: Env }>();

// Middlewares Globales
app.use('*', cors({
	origin: (origin, c) => {
		const allowedOrigins = (c.env.CORS_ALLOWED_ORIGINS || "").split(',');
		// Permitir localhost en desarrollo o dominios específicos en prod
		return allowedOrigins.includes(origin) || allowedOrigins.includes('*') ? origin : undefined;
	},
	allowMethods: ['GET', 'POST', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
	maxAge: 600,
}));

// Recomendaciones IA
app.route('/api/suggest', suggestionRoutes);

// Manejo de Errores Global
app.notFound((c) => c.json({success: false, error: 'Ruta no encontrada'}, 404));

app.onError((err, c) => {
	console.error(`[Hono Error] ${err}`);
	return c.json({success: false, error: 'Error Interno del Servidor'}, 500);
});

export default app;
