import { z } from 'zod';

export const sendCodeSchema = z.object({
	telefono: z.string().min(7, "El teléfono es muy corto"),
	codigoPais: z.string().optional().default("57"), // Default Colombia si no viene
});

export const verifyCodeSchema = z.object({
	telefono: z.string().min(7),
	code: z.string().length(6, "El código debe ser de 6 dígitos"), // Usaremos 6 dígitos para más seguridad
});
