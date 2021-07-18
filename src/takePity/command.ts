import { isNil } from 'ramda';
import { DOUBLE_CLICK_MILLISECONDS, EXTENSION_NAME } from '../constants';
import { provideAid } from '../listenForPleas/socket';

const name = 'takepity';
const fullName = `${EXTENSION_NAME}.${name}`;
const friendlyName = 'Take pity';
const description = 'Take pity on a needy amagrammer';

let previouslySelectedId = '';
let previousSelectionTime = 0;

const now = () => new Date().getTime();

const updateSelection = (id: string) => {
	previouslySelectedId = id;
	previousSelectionTime = new Date().getTime();
};

const resetSelection = () => {
	previouslySelectedId = '';
	previousSelectionTime = 0;
};

const action = async (id: string): Promise<void> => {
	if (previouslySelectedId !== id) {
		return updateSelection(id);
	}

	if (isNil(previousSelectionTime) || now() - previousSelectionTime > DOUBLE_CLICK_MILLISECONDS) {
		return updateSelection(id);
	}

	resetSelection();
	provideAid(id);
};

export { fullName as name, friendlyName, description, action };
