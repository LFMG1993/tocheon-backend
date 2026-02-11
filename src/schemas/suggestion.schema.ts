import { z } from 'zod';

export const suggestionSchema = z.object({
	lat: z.number().optional(),
	lon: z.number().optional(),
});

// Tipo inferido para usar en el controlador
export type SuggestionInput = z.infer<typeof suggestionSchema>;
