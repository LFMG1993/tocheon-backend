import {GoogleGenerativeAI, GenerationConfig} from '@google/generative-ai';

// Su única responsabilidad es obtener sugerencias de Gemini.
export async function getGeminiSuggestions(apiKey: string, coords?: { lat?: number; lon?: number }) {
	const genAI = new GoogleGenerativeAI(apiKey);

	let prompt: string;

	if (coords?.lat && coords?.lon) {
		prompt = `
      Eres un experto guía turístico enfocado en el cuidado de los ciudadanos o visitantes de Cúcuta, Colombia.
      Basado en la ubicación con latitud ${coords.lat} y longitud ${coords.lon},
      sugiere 5 lugares interesantes donde el usuario pueda encontrar alimentacion saludable en Google Maps que estén cerca.
      Para cada lugar, proporciona una descripción corta y atractiva, y su categoría (ej: Restaurante, Parque, Café).
      Devuelve el resultado como un array JSON con el formato:
      [{"name": "Nombre del Lugar", "category": "Categoría", "description": "Descripción."}]
    `;
	} else {
		prompt = `
      Eres un experto guía turístico de Cúcuta, Colombia.
      Sugiere 5 lugares aleatorios, icónicos o muy populares en la ciudad de Cúcuta, deben ser aleatorios en cada consulta que cualquier visitante o local debería conocer.
      Para cada lugar, proporciona una descripción corta y atractiva, y su categoría (ej: Monumento, Restaurante, Parque).
      Devuelve el resultado como un array JSON con el formato:
      [{"name": "Nombre del Lugar", "category": "Categoría", "description": "Descripción."}]
    `;
	}

	// 1. Usamos el modelo moderno y habilitamos el modo JSON para una respuesta fiable.
	const generationConfig: GenerationConfig = {
		responseMimeType: "application/json",
	};

	const model = genAI.getGenerativeModel({
		model: 'gemini-2.5-flash',
		generationConfig
	});
	const result = await model.generateContent(prompt);
	const response = await result.response;
	const text = response.text();

	return JSON.parse(text);
}
