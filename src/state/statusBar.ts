import * as vscode from 'vscode';
import { Idling, Ignored, Pitied, Pitying, UserState } from '../types/state';

const id = 'propilot.status';
const name = 'Propilot status';
const tooltip = 'Propilot status';

let statusBar: vscode.StatusBarItem;

const initialize = (): vscode.StatusBarItem => {
	if (statusBar === undefined) {
		statusBar = vscode.window.createStatusBarItem(id, vscode.StatusBarAlignment.Left);
		statusBar.name = name;
		statusBar.tooltip = tooltip;
	}
	return statusBar;
};

const update = (state: UserState) => {
	if (state instanceof Ignored) {
		statusBar.text = 'Ignored';
	} else if (state instanceof Pitied) {
		statusBar.text = 'Pitied';
	} else if (state instanceof Pitying) {
		statusBar.text = 'Taking pity';
	} else if (state instanceof Idling) {
		statusBar.text = 'Idling';
	}
};

export { initialize, update };
