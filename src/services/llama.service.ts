import Groq from "groq-sdk";

export class LlamaService {
	private client: Groq;

	constructor(apiKey: string) {
		this.client = new Groq({apiKey});
	}

	async getSuggestions(lat?: number, lon?: number) {
		const isLocationBased = lat && lon;

		// Definimos el contexto de "Experto Local" con fuerza
		const systemPrompt = `
      ROL: Eres un experto guía turístico local de Cúcuta, Norte de Santander, Colombia. Conoces la ciudad como la palma de tu mano (Barrios Caobos, El Malecón, El Centro, La Riviera, etc.).

      REGLAS CRÍTICAS:
      1. Solo recomienda lugares REALES que se puedan encontrar en Google Maps. NO inventes nombres de negocios.
      2. Las descripciones deben ser atractivas, útiles y en español, de unas 20-30 palabras.
      3. Si te dan coordenadas, busca lugares reales cercanos. Si no estás seguro de la cercanía exacta, sugiere lugares conocidos de esa zona o icónicos de la ciudad.

      FORMATO DE RESPUESTA (JSON PURO):
      Debes devolver un objeto JSON con una propiedad "suggestions" que contenga un array.
    `;

		let userTask: string;

		if (isLocationBased) {
			userTask = `
        Basado en la ubicación con latitud ${lat} y longitud ${lon},
      sugiere 5 lugares interesantes donde el usuario pueda encontrar alimentacion saludable en Google Maps que estén cerca.
      Para cada lugar, proporciona una descripción corta y atractiva, y su categoría (ej: Restaurante, Parque, Café).
      `;
		} else {
			userTask = `
       Eres un experto guía turístico de Cúcuta, Colombia.
      Sugiere 5 lugares aleatorios, icónicos o muy populares en la ciudad de Cúcuta, deben ser aleatorios en cada consulta que cualquier visitante o local debería conocer.
      Para cada lugar, proporciona una descripción corta y atractiva, y su categoría (ej: Monumento, Restaurante, Parque).
      `;
		}

		// Prompt de usuario para definir la estructura exacta
		const finalPrompt = `
      ${userTask}

      Genera el JSON con esta estructura exacta:
      {
        "suggestions": [
          {
            "name": "Nombre exacto del lugar",
            "category": "Categoría (ej: Restaurante, Parque, Café)",
            "description": "Descripción corta y atractiva."
          }
        ]
      }
    `;

		try {
			const completion = await this.client.chat.completions.create({
				messages: [
					{role: "system", content: systemPrompt},
					{role: "user", content: finalPrompt}
				],
				model: "llama-3.3-70b-versatile",

				temperature: 0.3,

				max_tokens: 1024,
				top_p: 1,
				stream: false,
				response_format: {type: "json_object"},
			});

			const content = completion.choices[0]?.message?.content;

			if (!content) {
				throw new Error("Respuesta vacía de Groq");
			}

			return JSON.parse(content);

		} catch (error) {
			console.error("Error en Groq Service:", error);
			throw error;
		}
	}
}
