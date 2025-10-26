import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {getGeminiSuggestions} from "./handlers/suggestions.handler";

// Hono
const app = new Hono<{ Bindings: Env }>();

// --- Middlewares Globales ---
const corsMiddleware = cors({
	origin: (origin, c) => {
		const allowedOrigins = c.env.CORS_ALLOWED_ORIGINS
			? c.env.CORS_ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
			: [];
		if (allowedOrigins.includes(origin)) {
			return origin;
		}
		return undefined;
	},
	allowMethods: ['GET', 'POST', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
});

app.use('/api/*', corsMiddleware);
// --- Rutas de la API ---

app.post('/api/suggest', async (c) => {
	try {
		const {lat, lon}: { lat?: number; lon?: number } = await c.req.json();
		const suggestions = await getGeminiSuggestions(c.env.GEMINI_API_KEY, {lat, lon});
		return c.json(suggestions);
	} catch (error: any) {
		console.error('Error en la ruta de sugerencias:', error);
		return c.json({error: error.message || 'Error al procesar la solicitud.'}, 500);
	}
});

app.notFound((c) => c.json({success: false, error: 'Not Found'}, 404));
app.onError((err, c) => {
	console.error(`[Hono Error] Unhandled error on path ${c.req.path}:`, err);
	return c.json({success: false, error: 'Internal Server Error'}, 500);
});

export default app;
