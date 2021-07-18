import * as vscode from 'vscode';
import { name as commandName, title as commandTitle } from './command';

const selector: vscode.DocumentFilter = { pattern: '*' };

const provider: vscode.CompletionItemProvider = {
	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext
	) {
		const completionItem = new vscode.CompletionItem('HALLLP');
		completionItem.kind = vscode.CompletionItemKind.User;
		completionItem.detail = 'Pro-kemon I choose you!';
		completionItem.command = {
			title: commandTitle,
			command: commandName,
		};

		return [completionItem];
	},
};

export { selector, provider };
