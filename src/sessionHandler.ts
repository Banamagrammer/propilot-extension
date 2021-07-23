import * as vsls from 'vsls';
import { neverMind } from './listenForPleas/socket';

let currentId: string;

const handleSessionCanceled = (): void => {
	neverMind();
};

const handleActiveSession = (e: vsls.SessionChangeEvent): void => {
	currentId = e.session.id!;
};

const handleSessionChanged = (e: vsls.SessionChangeEvent): void => {
	if (e.session.id !== null && e.session.id !== undefined) {
		handleActiveSession(e);
	} else {
		handleSessionCanceled();
	}
};

export default handleSessionChanged;
