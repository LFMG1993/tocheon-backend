import { Context } from 'hono';
import { sendCodeSchema, verifyCodeSchema } from '../schemas/auth.schema';
import { WhatsappService } from '../services/whatsapp.service';
import { FirebaseService } from '../services/firebase.service';

export const sendWhatsappCode = async (c: Context) => {
	const body = await c.req.json();
	const validation = sendCodeSchema.safeParse(body);

	if (!validation.success) {
		return c.json({ success: false, error: "Datos inválidos" }, 400);
	}

	const { telefono, codigoPais } = validation.data;
	const waService = new WhatsappService(c.env.SPAIID_APP_KEY, c.env.SPAIID_AUTH_KEY);

	// 1. Normalizar teléfono
	const normalizedPhone = waService.normalizePhone(telefono, codigoPais);

	if (!normalizedPhone) {
		return c.json({ success: false, error: "Teléfono inválido" }, 400);
	}

	// 2. Generar OTP (6 dígitos es más seguro)
	const otp = Math.floor(100000 + Math.random() * 900000).toString();

	// 3. Guardar en KV (Expira en 5 minutos = 300 segundos)
	await c.env.OTP_STORE.put(`otp:${normalizedPhone}`, otp, { expirationTtl: 300 });

	// 4. Enviar por WhatsApp
	const sent = await waService.sendOtp(normalizedPhone, otp);

	if (sent) {
		return c.json({
			success: true,
			message: "Código enviado correctamente",
			// En desarrollo podrías devolver el OTP para probar sin gastar saldo, pero en prod quítalo
			debug: otp
		});
	} else {
		return c.json({ success: false, error: "Error al enviar el mensaje de WhatsApp" }, 500);
	}
};

export const verifyWhatsappCode = async (c: Context) => {
	const body = await c.req.json();
	const validation = verifyCodeSchema.safeParse(body);

	if (!validation.success) {
		return c.json({ success: false, error: "Datos inválidos" }, 400);
	}

	const { telefono, code } = validation.data;
	const waService = new WhatsappService(c.env.SPAIID_APP_KEY, c.env.SPAIID_AUTH_KEY);
	const normalizedPhone = waService.normalizePhone(telefono);

	// 1. Buscar en KV
	const storedOtp = await c.env.OTP_STORE.get(`otp:${normalizedPhone}`);

	if (!storedOtp) {
		return c.json({ success: false, error: "El código ha expirado o no existe." }, 400);
	}

	if (storedOtp !== code) {
		return c.json({ success: false, error: "Código incorrecto." }, 400);
	}

	// 2. Si es correcto, generamos el Custom Token de Firebase
	const firebaseService = new FirebaseService(
		c.env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
		c.env.FIREBASE_PRIVATE_KEY,
		c.env.FIREBASE_PROJECT_ID
	);

	try {
		const customToken = await firebaseService.createCustomToken(normalizedPhone);

		// 3. Borrar el OTP usado para evitar reuso (seguridad)
		await c.env.OTP_STORE.delete(`otp:${normalizedPhone}`);

		return c.json({ success: true, token: customToken });
	} catch (error) {
		console.error(error);
		return c.json({ success: false, error: "Error generando sesión." }, 500);
	}
};
