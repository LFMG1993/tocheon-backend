import {Context} from 'hono';
import {sendCodeSchema, verifyCodeSchema} from '../schemas/auth.schema';
import {WhatsappService} from '../services/whatsapp.service';
import {FirebaseService} from '../services/firebase.service';

export const sendWhatsappCode = async (c: Context) => {
	const body = await c.req.json();
	const validation = sendCodeSchema.safeParse(body);

	if (!validation.success) {
		return c.json({success: false, error: "Datos inválidos"}, 400);
	}

	const {telefono, codigoPais} = validation.data;
	const waService = new WhatsappService(c.env.SPAIID_API_TOKEN, c.env.SPAIID_WHATSAPP_ID);
	const normalizedPhone = waService.normalizePhone(telefono, codigoPais);

	if (!normalizedPhone) {
		return c.json({success: false, error: "Teléfono inválido"}, 400);
	}

	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	await c.env.OTP_STORE.put(`otp:${normalizedPhone}`, otp, {expirationTtl: 300});
	const sent = await waService.sendOtp(normalizedPhone, otp);

	if (sent) {
		return c.json({
			success: true,
			message: "Código enviado correctamente",
			debug: false
		});
	} else {
		return c.json({success: false, error: "Error al enviar el mensaje de WhatsApp"}, 500);
	}
};

export const verifyWhatsappCode = async (c: Context) => {
	const body = await c.req.json();
	const validation = verifyCodeSchema.safeParse(body);

	if (!validation.success) {
		return c.json({success: false, error: "Datos inválidos"}, 400);
	}

	const {telefono, code} = validation.data;
	const waService = new WhatsappService(c.env.SPAIID_API_TOKEN, c.env.SPAIID_WHATSAPP_ID);
	const normalizedPhone = waService.normalizePhone(telefono);

	// Buscar en KV
	const storedOtp = await c.env.OTP_STORE.get(`otp:${normalizedPhone}`);

	if (!storedOtp) {
		return c.json({success: false, error: "El código ha expirado o no existe."}, 400);
	}

	if (storedOtp !== code) {
		return c.json({success: false, error: "Código incorrecto."}, 400);
	}

	const firebaseService = new FirebaseService(
		c.env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
		c.env.FIREBASE_PRIVATE_KEY,
		c.env.FIREBASE_PROJECT_ID
	);

	try {
		const customToken = await firebaseService.createCustomToken(normalizedPhone);

		await c.env.OTP_STORE.delete(`otp:${normalizedPhone}`);

		return c.json({success: true, token: customToken});
	} catch (error) {
		console.error(error);
		return c.json({success: false, error: "Error generando sesión."}, 500);
	}
};
