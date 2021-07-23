import * as vscode from 'vscode';
import { getApi } from 'vsls';
import * as WebSocket from 'ws';
import { MyPlea, Plea, PleaRequest, PleaSession } from '../types/plea';
import { addPlea, clearPleas, getState, removePlea, setPleas, setState } from '../state/state';
import { Idling, Ignored, Pitied, Pitying, Pleading } from '../types/state';
import { complement, isNil } from 'ramda';

const protocol = 'ws';
const port = 8080;
const domain = 'localhost';
const url = `${protocol}://${domain}:${port}`;
const reconnectTimer = 15 * 1000;

let socket: WebSocket | undefined;
let intervalId: NodeJS.Timeout;
let shouldReconnect = true;

const isSocketActive = () => socket !== undefined && socket.readyState < WebSocket.CLOSING;

const cannotListen = () => isSocketActive();

const handleOpen = () => {
	console.log('Connected');
};

const handleClose = () => {
	clearPleas();
	setState(new Idling());

	console.log('Disconnected');
	if (shouldReconnect) {
		console.log('Reconnecting...');
	}
};

const handleUpdate: (data: Plea) => void = addPlea;

const handleRemove = (data: Plea) => {
	removePlea(data.id);
};

const handleList = ({ pleas }: { pleas: Plea[] }) => {
	setPleas(pleas);
};

const handlePleaAccepted = (plea: MyPlea) => {
	setState(new Ignored(plea.id, plea.userId));
};

const handlePleaCanceled = ({ id }: { id: string }) => {
	vscode.window.showInformationMessage(`Plea ${id} canceled`);
	setState(new Idling());
};

const handlePleaNotFound = ({ id }: { id: string }) => {
	vscode.window.showErrorMessage(`Plea ${id} not found`);
};

const handleSessionResponse = async (data: PleaSession): Promise<void> => {
	const vsls = await getApi();
	await vsls?.join(vscode.Uri.parse(data.url, true));

	setState(new Pitying(data.id, data.sessionId));
};

const messageHandlers: Record<Topic, (...args: any[]) => void | Promise<void>> = {
	added: handleUpdate,
	updated: handleUpdate,
	removed: handleRemove,
	list: handleList,
	pleaAccepted: handlePleaAccepted,
	pleaCanceled: handlePleaCanceled,
	pleaNotFound: handlePleaNotFound,
	sessionInfo: handleSessionResponse,
};

const connect = (): void => {
	if (cannotListen()) {
		return;
	}

	socket = new WebSocket(url);

	socket.on('open', handleOpen);

	socket.on('close', handleClose);

	socket.on('message', (message: string) => {
		const { topic, ...data }: { topic: Topic; data: unknown } = JSON.parse(message);

		messageHandlers[topic](data);
		console.log(`Received: ${message}`);
	});
};

const initialize = () => {
	shouldReconnect = true;
	console.log('Connecting...');
	intervalId = setInterval(connect, reconnectTimer);
	connect();
};

const stopListening = () => {
	clearInterval(intervalId);
	shouldReconnect = false;
	socket?.close();
};

const pleadForHelp = (plea: PleaRequest) => {
	socket?.send(
		JSON.stringify({
			topic: 'halllpPlease',
			data: plea,
		})
	);
};

const neverMind = () => {
	const { state } = getState();

	let id, userId;

	if (state instanceof Ignored || state instanceof Pitied) {
		id = state.pleaId;
		userId = state.userId;
	}

	const notNil = complement(isNil);
	const canCancel = notNil(id) && notNil(userId);

	if (canCancel) {
		socket?.send(
			JSON.stringify({
				topic: 'neverMind',
				data: { id, userId },
			})
		);
	}
};

const provideAid = (pleaId: string) => {
	socket?.send(
		JSON.stringify({
			topic: 'sessionRequested',
			data: { id: pleaId },
		})
	);
};

enum Topic {
	added = 'added',
	list = 'list',
	updated = 'updated',
	removed = 'removed',
	pleaAccepted = 'pleaAccepted',
	pleaCanceled = 'pleaCanceled',
	pleaNotFound = 'pleaNotFound',
	sessionInfo = 'sessionInfo',
}

export { initialize, neverMind, stopListening, provideAid, pleadForHelp };
