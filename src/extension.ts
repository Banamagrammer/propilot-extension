// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getApi } from 'vsls';
import * as halpCommand from './callForHalp/command';
import * as halpCompletion from './callForHalp/completion';
import * as takePityCommand from './takePity/command';
import { EXTENSION_NAME, PLEAS_VIEW, PRO_CONFIGURATION } from './constants';
import { listen, stopListening } from './listenForPleas/socket';
import AmateursTreeDataProvider from './listenForPleas/view';
import handleSessionEvent from './sessionHandler';

const handleConfigurationChanged = (e: vscode.ConfigurationChangeEvent) => {
	if (e.affectsConfiguration(`${EXTENSION_NAME}.${PRO_CONFIGURATION}`)) {
		const amPro = vscode.workspace.getConfiguration(EXTENSION_NAME)[PRO_CONFIGURATION];
		if (amPro) {
			listen();
		} else {
			stopListening();
		}
	}
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "propilot" is now active!');

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

	const vsls = await getApi();
	const sessionListener = vsls?.onDidChangeSession(handleSessionEvent);

	context.subscriptions.push(halp, takePity, provider, configListener, treeView);
	if (sessionListener !== undefined) {
		context.subscriptions.push(sessionListener);
	}

	listen(treeProvider.refresh.bind(treeProvider));
}

// this method is called when your extension is deactivated
export function deactivate() {}
