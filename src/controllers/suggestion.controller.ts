import {Context} from 'hono';
import {suggestionSchema} from '../schemas/suggestion.schema';
import {LlamaService} from '../services/llama.service';
import {GeminiService} from '../services/gemini.service';
import {OpenAIService} from '../services/openai.service';

type Bindings = {
	GROQ_API_KEY: string;
	GEMINI_API_KEY: string;
};

export const getSuggestionsController = async (c: Context<{ Bindings: Bindings }>) => {
	// Validar entrada
	const body = await c.req.json();
	const validation = suggestionSchema.safeParse(body);

	if (!validation.success) {
		return c.json({success: false, error: "Datos inválidos"}, 400);
	}

	const {lat, lon} = validation.data;

	// Instanciar Servicios
	const gemini = new GeminiService(c.env.GEMINI_API_KEY);
	const openai = new OpenAIService(c.env.GROQ_API_KEY);
	const llama = new LlamaService(c.env.GROQ_API_KEY);

	// INTENTO 1: GEMINI
	try {
		const data = await gemini.getSuggestions(lat, lon);
		return c.json({success: true, provider: "Gemini", data});
	} catch (e) {
		console.warn("⚠️ Gemini falló. Cambiando a OpenAI...");
	}

	//  INTENTO 2: OPENAI
	try {
		const data = await openai.getSuggestions(lat, lon);
		return c.json({success: true, provider: "OpenAI", data});
	} catch (e) {
		console.warn("⚠️ OpenAI falló. Cambiando a Llama de emergencia...");
	}

	// INTENTO 3: LLAMA
	try {
		const data = await llama.getSuggestions(lat, lon);
		return c.json({success: true, provider: "Llama3", data});
	} catch (e) {
		console.error("🔥 FATAL: Todos los servicios de IA fallaron.");
		return c.json({success: false, error: "Servicio temporalmente no disponible"}, 500);
	}
};
