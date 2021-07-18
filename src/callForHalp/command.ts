import * as http from 'http';
import * as vscode from 'vscode';
import * as vsls from 'vsls';
import { DEFAULT_HANDLE, EXTENSION_NAME, HANDLE_CONFIGURATION, PORT } from '../constants';
import { PleaRequest } from '../types/plea';

const title = 'halpMe';
const name = 'ineedahepro';
const fullName = `${EXTENSION_NAME}.${name}`;

const url = `http://localhost:${PORT}/halllp`;

const action = async (): Promise<void> => {
	const api = await vsls.getApi();
	const sessionUri = await api?.share();

	if (api === null || sessionUri === null || sessionUri === undefined) {
		return;
	}

	let handle: string =
		vscode.workspace.getConfiguration(EXTENSION_NAME).get(HANDLE_CONFIGURATION) ?? '';

	if (handle === '') {
		handle =
			(vscode.workspace.getConfiguration(EXTENSION_NAME).inspect(HANDLE_CONFIGURATION)
				?.defaultValue as string) ?? DEFAULT_HANDLE;
	}
	const plea: PleaRequest = {
		sessionId: api.session.id || '',
		url: sessionUri.toString(),
		handle,
		language: vscode.window.activeTextEditor?.document?.languageId ?? 'unknown',
	};

	const requestData = JSON.stringify(plea);

	const options: http.RequestOptions = {
		method: 'PUT',
		port: PORT,
		headers: {
			/* eslint-disable @typescript-eslint/naming-convention */
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(requestData),
			/* eslint-enable @typescript-eslint/naming-convention */
		},
	};

	const req = http.request(url, options, (res) => {
		res.on('data', (d) => console.log(d.toString()));
	});

	req.write(requestData);
	req.end();
};

export { title, fullName as name, action };
