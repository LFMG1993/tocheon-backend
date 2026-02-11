import Groq from "groq-sdk";

export class OpenAIService {
	private client: Groq;

	constructor(apiKey: string) {
		this.client = new Groq({apiKey});
	}

	async getSuggestions(lat?: number, lon?: number) {
		const isLocationBased = lat && lon;

		const systemPrompt = isLocationBased
			? `Basado en la ubicación con latitud ${lat} y longitud ${lon},
      sugiere 5 lugares interesantes donde el usuario pueda encontrar alimentacion saludable en Google Maps que estén cerca.
      Para cada lugar, proporciona una descripción corta y atractiva, y su categoría (ej: Restaurante, Parque, Café).`
			: `Eres un experto guía turístico de Cúcuta, Colombia.
      Sugiere 5 lugares aleatorios, icónicos o muy populares en la ciudad de Cúcuta, deben ser aleatorios en cada consulta que cualquier visitante o local debería conocer.
      Para cada lugar, proporciona una descripción corta y atractiva, y su categoría (ej: Monumento, Restaurante, Parque).`;

		const userPrompt = `
      Genera un JSON válido con esta estructura exacta:
      {
        "suggestions": [
          {
            "name": "Nombre",
            "category": "Categoría",
            "description": "Descripción atractiva (20 palabras)"
          }
        ]
      }
    `;

		try {
			const completion = await this.client.chat.completions.create({
				messages: [
					{role: "system", content: systemPrompt},
					{role: "user", content: userPrompt}
				],
				model: "openai/gpt-oss-120b",
				temperature: 0.3,
				response_format: {type: "json_object"},
			});

			const content = completion.choices[0]?.message?.content || "{}";
			return JSON.parse(content);

		} catch (error) {
			console.error("❌ Error en OpenAIService:", error);
			throw error;
		}
	}
}
