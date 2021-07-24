// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getApi } from 'vsls';
import * as halpCommand from './callForHalp/command';
import * as halpCompletion from './callForHalp/completion';
import * as takePityCommand from './takePity/command';
import { EXTENSION_NAME, HANDLE_CONFIGURATION, PLEAS_VIEW, PRO_CONFIGURATION } from './constants';
import {
	initialize as initializeState,
	setHandle,
	setIsPro,
	addListener as addStateListener,
} from './state/state';
import { initialize as initializeStatusBar } from './state/statusBar';
import { initialize as initializeSocket } from './listenForPleas/socket';
import AmateursTreeDataProvider from './listenForPleas/view';
import handleSessionEvent from './sessionHandler';
import { PropilotState } from './types/state';

const handleConfigurationChanged = (e: vscode.ConfigurationChangeEvent) => {
	if (e.affectsConfiguration(`${EXTENSION_NAME}.${PRO_CONFIGURATION}`)) {
		setIsPro(vscode.workspace.getConfiguration(EXTENSION_NAME)[PRO_CONFIGURATION]);
	} else if (e.affectsConfiguration(`${EXTENSION_NAME}.${HANDLE_CONFIGURATION}`)) {
		setHandle(vscode.workspace.getConfiguration(EXTENSION_NAME)[HANDLE_CONFIGURATION]);
	}
};

const handleStateUpdated =
	(treeProvider: AmateursTreeDataProvider) => (oldState: PropilotState, newState: PropilotState) =>
		treeProvider.refresh.call(treeProvider, newState);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "propilot" is now active!');

	const statusBarItem = initializeStatusBar();
	initializeState();
	statusBarItem.show();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let halp = vscode.commands.registerCommand(halpCommand.name, halpCommand.action);
	let takePity = vscode.commands.registerCommand(takePityCommand.name, takePityCommand.action);

	let provider = vscode.languages.registerCompletionItemProvider(
		halpCompletion.selector,
		halpCompletion.provider
	);

	const configListener = vscode.workspace.onDidChangeConfiguration(handleConfigurationChanged);

	const treeProvider = new AmateursTreeDataProvider();
	const treeView = vscode.window.registerTreeDataProvider(PLEAS_VIEW, treeProvider);

	addStateListener(handleStateUpdated(treeProvider));

	const vsls = await getApi();
	const sessionListener = vsls?.onDidChangeSession(handleSessionEvent);

	context.subscriptions.push(statusBarItem, halp, takePity, provider, configListener, treeView);
	if (sessionListener !== undefined) {
		context.subscriptions.push(sessionListener);
	}

	initializeSocket();
}

// this method is called when your extension is deactivated
export function deactivate() {}
