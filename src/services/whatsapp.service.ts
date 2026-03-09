export class WhatsappService {
	private apiToken: string;
	private whatsappId: string;

	constructor(apiToken: string, whatsappId: string) {
		this.apiToken = apiToken;
		this.whatsappId = whatsappId;
	}

	// Normaliza el teléfono.
	normalizePhone(phone: string, countryCode: string = ''): string {
		let fullPhone = phone;
		if (!phone.startsWith(countryCode) && countryCode) {
			fullPhone = countryCode + phone;
		}

		fullPhone = fullPhone.replace(/\D/g, '').replace(/^0+/, '');
		return fullPhone;
	}

	async sendOtp(phone: string, otp: string): Promise<boolean> {
		const mensajes = [
			`Toche On: Tu codigo de verificación es: ${otp}`,
		];

		const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];

		const payload = {
			number: phone,
			body: mensaje
		};

		try {
			const response = await fetch(`https://api.spaiid.com/api/messages/send?whatsappId=${this.whatsappId}`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.apiToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload),
			});

			const responseText = await response.text();
			let data: any;

			try {
				data = JSON.parse(responseText);
			} catch (e) {
				console.error(`❌ Error Spaiid (No es JSON). Status: ${response.status}. Respuesta:`, responseText);
				return false;
			}

			if (data && data.success === true) {
				return true;
			}
			console.error('❌ Error Spaiid API (Success false):', data);
			return false;
		} catch (error) {
			console.error('Error enviando WhatsApp:', error);
			return false;
		}
	}
}
