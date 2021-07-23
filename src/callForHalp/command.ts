import * as vscode from 'vscode';
import * as vsls from 'vsls';
import { DEFAULT_HANDLE, EXTENSION_NAME, HANDLE_CONFIGURATION, PORT } from '../constants';
import { pleadForHelp } from '../listenForPleas/socket';
import { PleaRequest } from '../types/plea';

const title = 'halpMe';
const name = 'ineedahepro';
const fullName = `${EXTENSION_NAME}.${name}`;

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

	pleadForHelp(plea);
};

export { title, fullName as name, action };
