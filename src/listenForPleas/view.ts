import * as vscode from 'vscode';
import { compose, map, propOr, uniqBy } from 'ramda';
import { Plea } from '../types/plea';
import { getState } from '../state/state';
import * as takePity from '../takePity/command';
import { PropilotState } from '../types/state';

const toLanguage = (plea: Plea): PleaLanguage => new PleaLanguage(plea.language);
const toPlea = (plea: Plea): PleaItem => new PleaItem(plea);

const getLanguages = compose(uniqBy(propOr('', 'label')), map(toLanguage));

export default class AmateursTreeDataProvider implements vscode.TreeDataProvider<PleaTreeItem> {
	private languages: PleaLanguage[];
	private pleas: PleaItem[];
	private _onDidChangeTreeData: vscode.EventEmitter<PleaTreeItem | undefined | null | void> =
		new vscode.EventEmitter<PleaTreeItem | undefined | null | void>();

	constructor(pleas?: Plea[]) {
		this.languages = getLanguages(pleas ?? []);
		this.pleas = pleas?.map(toPlea) ?? [];
	}

	getTreeItem(element: PleaTreeItem): PleaTreeItem | Thenable<PleaTreeItem> {
		return Promise.resolve(element);
	}

	getChildren(element?: PleaTreeItem): vscode.ProviderResult<PleaTreeItem[]> {
		return element instanceof PleaLanguage
			? Promise.resolve(this.pleas.filter((plea) => plea.language === element.label))
			: Promise.resolve(this.languages ?? []);
	}

	readonly onDidChangeTreeData: vscode.Event<PleaTreeItem | undefined | null | void> =
		this._onDidChangeTreeData.event;

	refresh(state: PropilotState): void {
		const { pleas } = state;
		this.pleas = pleas.map(toPlea);
		this.languages = getLanguages(pleas);
		this._onDidChangeTreeData.fire();
		console.log(getState().state);
	}
}

type PleaTreeItem = PleaLanguage | PleaItem;

class PleaLanguage extends vscode.TreeItem {
	constructor(language: string) {
		super(language, vscode.TreeItemCollapsibleState.Expanded);
	}
}

class PleaItem extends vscode.TreeItem {
	public language: string;

	constructor(plea: Plea) {
		super(plea.handle, vscode.TreeItemCollapsibleState.None);
		this.id = plea.id.toString();
		this.language = plea.language;
		this.tooltip = `Created at: ${plea.createdAt}`;
		this.command = this.takePity();
	}

	takePity(): vscode.Command {
		return {
			command: takePity.name,
			title: takePity.friendlyName,
			tooltip: takePity.description,
			arguments: [this.id],
		};
	}
}
