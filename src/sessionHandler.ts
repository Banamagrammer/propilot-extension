import * as http from 'http';
import * as vsls from 'vsls';
import { PORT } from './constants';

let currentId: string;

const handleSessionCanceled = async (): Promise<void> => {
	const options: http.RequestOptions = {
		method: 'DELETE',
		port: PORT,
	};

	const url = `http://localhost:${PORT}/halllp/${currentId}`;

	const req = http.request(url, options, (res) => {
		res.on('close', () => {
			console.log(`${currentId} deleted`);
		});
	});

	req.end();
};

const handleActiveSession = (e: vsls.SessionChangeEvent): void => {
	currentId = e.session.id!;
};

const handleSessionChanged = async (e: vsls.SessionChangeEvent): Promise<void> => {
	if (e.session.id !== null && e.session.id !== undefined) {
		handleActiveSession(e);
	} else {
		await handleSessionCanceled();
	}
};

export default handleSessionChanged;
