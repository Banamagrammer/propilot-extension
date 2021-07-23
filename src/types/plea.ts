export interface PleaRequest {
	sessionId: string;
	url: string;
	handle: string;
	language: string;
}

export interface Plea {
	id: string;
	handle: string;
	language: string;
	createdAt: Date;
}

export interface PleaSession extends Plea {
	sessionId: string;
	url: string;
}

export interface MyPlea extends PleaSession {
	userId: string;
}
