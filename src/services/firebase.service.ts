import { importPKCS8, SignJWT } from 'jose';

export class FirebaseService {
	private serviceAccountEmail: string;
	private privateKey: string;
	private projectId: string;

	constructor(email: string, privateKey: string, projectId: string) {
		this.serviceAccountEmail = email;
		// Aseguramos que la llave tenga el formato correcto (reemplazando \\n si viene del env)
		this.privateKey = privateKey.replace(/\\n/g, '\n');
		this.projectId = projectId;
	}

	async createCustomToken(uid: string): Promise<string> {
		try {
			// Importar la llave privada
			const algorithm = 'RS256';
			const ecPrivateKey = await importPKCS8(this.privateKey, algorithm);

			// Crear el JWT (Custom Token)
			// Firebase requiere: iss, sub, aud, iat, exp, uid
			const jwt = await new SignJWT({ uid: uid })
				.setProtectedHeader({ alg: algorithm })
				.setIssuer(this.serviceAccountEmail)
				.setSubject(this.serviceAccountEmail)
				.setAudience(`https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit`)
				.setIssuedAt()
				.setExpirationTime('1h') // El token dura 1 hora para ser canjeado
				.sign(ecPrivateKey);

			return jwt;
		} catch (error) {
			console.error("Error generando Custom Token:", error);
			throw new Error("No se pudo generar el token de autenticación.");
		}
	}
}
