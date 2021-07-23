import { Lens, clone, lensProp, set, append, compose, prop, update } from 'ramda';
import * as vscode from 'vscode';
import {
	DEFAULT_HANDLE,
	EXTENSION_NAME,
	HANDLE_CONFIGURATION,
	PRO_CONFIGURATION,
} from '../constants';
import { Plea } from '../types/plea';
import { idle, PropilotState, StateListener, UserState } from '../types/state';

const getHandle = () => {
	let handle: string =
		vscode.workspace.getConfiguration(EXTENSION_NAME).get(HANDLE_CONFIGURATION) ?? '';

	if (handle === '') {
		handle =
			(vscode.workspace.getConfiguration(EXTENSION_NAME).inspect(HANDLE_CONFIGURATION)
				?.defaultValue as string) ?? DEFAULT_HANDLE;
	}
	return handle;
};

const getIsPro = () => vscode.workspace.getConfiguration(EXTENSION_NAME)[PRO_CONFIGURATION];

let state: PropilotState = {
	isPro: false,
	handle: '',
	state: idle,
	pleas: [],
};

let listeners: StateListener[] = [];

let initialized = false;

const initialize = () => {
	state = initialized
		? state
		: {
				isPro: getIsPro(),
				handle: getHandle(),
				state: idle,
				pleas: [],
		  };

	return state;
};

const getState = (): PropilotState => state;

const getPleas = compose(prop('pleas'), getState);

const broadcast = (oldState: PropilotState) => {
	for (const listener of listeners) {
		listener(oldState, getState());
	}
};

const updateState = <T>(lens: Lens<PropilotState, T>, newValue: T): PropilotState => {
	const oldState = getState();
	state = set<PropilotState, T>(lens, newValue, state);

	broadcast(oldState);
	return getState();
};

const setIsPro = (isPro: boolean) => updateState(lensProp<PropilotState>('isPro'), isPro);
const setHandle = (handle: string) => updateState(lensProp<PropilotState>('handle'), handle);
const setPleas = (pleas: Plea[]) => updateState(lensProp<PropilotState>('pleas'), pleas);
const setState = (state: UserState) => updateState(lensProp<PropilotState>('state'), state);

const addListener = (listener: StateListener) => {
	listeners = append(listener, listeners);
};

const addPlea = (plea: Plea) => {
	const pleas = getPleas();
	const index = pleas.findIndex((p) => p.id === plea.id);

	return index > -1 ? setPleas(update(index, plea, pleas)) : setPleas(append(plea, pleas));
};

const removePlea = (id: string) => setPleas(getPleas().filter((plea) => plea.id !== id));

const clearPleas = () => setPleas([]);

export {
	addListener,
	getState,
	initialize,
	setHandle,
	setIsPro,
	addPlea,
	removePlea,
	clearPleas,
	setPleas,
	setState,
};
