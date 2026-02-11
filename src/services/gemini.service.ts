import {GoogleGenerativeAI} from '@google/generative-ai';

export class GeminiService {
	private genAI: GoogleGenerativeAI;

	constructor(apiKey: string) {
		this.genAI = new GoogleGenerativeAI(apiKey);
	}

	async getSuggestions(lat?: number, lon?: number) {
		const schema = {
			type: "OBJECT",
			properties: {
				suggestions: {
					type: "ARRAY",
					items: {
						type: "OBJECT",
						properties: {
							name: {type: "STRING"},
							category: {type: "STRING"},
							description: {type: "STRING"},
						},
						required: ["name", "category", "description"],
					},
				},
			},
		};

		const model = this.genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
			generationConfig: {
				responseMimeType: "application/json",
				responseSchema: schema as any,
			},
		});

		const prompt = (lat && lon)
			? `Basado en la ubicación con latitud ${lat} y longitud ${lon},
      sugiere 5 lugares interesantes donde el usuario pueda encontrar alimentacion saludable en Google Maps que estén cerca.
      Para cada lugar, proporciona una descripción corta y atractiva, y su categoría (ej: Restaurante, Parque, Café).`
			: `Eres un experto guía turístico de Cúcuta, Colombia.
      Sugiere 5 lugares aleatorios, icónicos o muy populares en la ciudad de Cúcuta, deben ser aleatorios en cada consulta que cualquier visitante o local debería conocer.
      Para cada lugar, proporciona una descripción corta y atractiva, y su categoría (ej: Monumento, Restaurante, Parque).`;

		try {
			const result = await model.generateContent(prompt);
			return JSON.parse(result.response.text());
		} catch (error) {
			console.error("Gemini Error:", error);
			throw error;
		}
	}
}
