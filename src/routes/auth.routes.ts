import { Hono } from 'hono';
import { sendWhatsappCode, verifyWhatsappCode } from '../controllers/auth.controller';

const authRoutes = new Hono();

authRoutes.post('/whatsapp/send', sendWhatsappCode);
authRoutes.post('/whatsapp/verify', verifyWhatsappCode);

export default authRoutes;
