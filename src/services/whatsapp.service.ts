export class WhatsappService {
	private appKey: string;
	private authKey: string;

	constructor(appKey: string, authKey: string) {
		this.appKey = appKey;
		this.authKey = authKey;
	}

	// Normaliza el teléfono.
	normalizePhone(phone: string, countryCode: string = ''): string {
		// Si el teléfono no incluye el código de país, lo concatenamos
		let fullPhone = phone;
		if (!phone.startsWith(countryCode) && countryCode) {
			fullPhone = countryCode + phone;
		}

		// Eliminar no dígitos y ceros a la izquierda
		fullPhone = fullPhone.replace(/\D/g, '').replace(/^0+/, '');
		return fullPhone;
	}

	async sendOtp(phone: string, otp: string): Promise<boolean> {
		const mensajes = [
			`Tu verificación es: ${otp}`,
			`Hola, tu código es: ${otp}`,
			`Aquí tienes tu código de acceso: ${otp}`,
			`Utiliza este código para continuar: ${otp}`,
			`Recibiste un código de verificación: ${otp}`,
			`¡Hola! Este es tu código temporal: ${otp}`,
			`Código de seguridad: ${otp}`,
			`Por favor ingresa este código: ${otp}`,
			`Tu código para PedidosVen es: ${otp}`,
			`Atención, tu código es: ${otp}`,
		];

		// Seleccionar mensaje aleatorio
		const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];

		// Preparar FormData (Spaiid parece usar multipart/form-data basado en el PHP array)
		const formData = new FormData();
		formData.append('app_key', this.appKey);
		formData.append('auth_key', this.authKey);
		formData.append('to', phone);
		formData.append('message', mensaje);

		try {
			const response = await fetch('https://spaiid.com/api/whatsapp-web/send-message', {
				method: 'POST',
				body: formData,
			});

			const data: any = await response.json();

			if (data && data.data && data.data.success === true) {
				return true;
			}
			console.error('Error Spaiid API:', data);
			return false;
		} catch (error) {
			console.error('Error enviando WhatsApp:', error);
			return false;
		}
	}
}
