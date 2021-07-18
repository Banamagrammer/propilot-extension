import * as vscode from 'vscode';
import { getApi } from 'vsls';
import * as WebSocket from 'ws';
import { EXTENSION_NAME, PRO_CONFIGURATION } from '../constants';
import { Plea, PleaSession } from '../types/plea';
import { addPlea, clearPleas, removePlea, setPleas } from './getPleas';

const protocol = 'ws';
const port = 8080;
const domain = 'localhost';
const url = `${protocol}://${domain}:${port}`;
const reconnectTimer = 15 * 1000;

let socket: WebSocket | undefined;
let intervalId: NodeJS.Timeout;
let shouldReconnect = true;

let subscriptions: (() => void)[] = [];

const isSocketActive = () => socket !== undefined && socket.readyState < WebSocket.CLOSING;

const amPro = () => vscode.workspace.getConfiguration(EXTENSION_NAME)[PRO_CONFIGURATION];

const cannotListen = () => isSocketActive() || !amPro();

const sendNotifications = (): void => {
	for (const subscription of subscriptions) {
		subscription();
	}
};

const handleOpen = () => {
	console.log('Connected');
};

const handleClose = () => {
	clearPleas();
	sendNotifications();

	console.log('Disconnected');
	if (shouldReconnect) {
		console.log('Reconnecting...');
	}
};

const handleUpdate: (data: Plea) => void = addPlea;

const handleRemove = (data: Plea) => {
	removePlea(data.id);
};

const handleList = ({ pleas }: { pleas: Plea[] }) => setPleas(pleas);

const handleSessionResponse = async (data: PleaSession): Promise<void> => {
	const vsls = await getApi();
	await vsls?.join(vscode.Uri.parse(data.url, true));
};

const handleSessionNotFound = ({ id }: { id: string }) => {
	vscode.window.showErrorMessage(`Plea ${id} not found`);
};

const messageHandlers: Record<Topic, (...args: any[]) => void | Promise<void>> = {
	added: handleUpdate,
	updated: handleUpdate,
	removed: handleRemove,
	list: handleList,
	sessionInfo: handleSessionResponse,
	sessionNotFound: handleSessionNotFound,
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
		sendNotifications();
		console.log(`Received: ${message}`);
	});
};

const listen = (...subscribers: { (): void }[]) => {
	subscriptions = subscribers;
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

const provideAid = (pleaId: string) => {
	socket?.send(
		JSON.stringify({
			topic: 'sessionRequested',
			// data: { id: pleaId },
			data: { id: `${pleaId}aoeu` },
		})
	);
};

enum Topic {
	added = 'added',
	list = 'list',
	updated = 'updated',
	removed = 'removed',
	sessionInfo = 'sessionInfo',
	sessionNotFound = 'sessionNotFound',
}

export { listen, stopListening, provideAid };
