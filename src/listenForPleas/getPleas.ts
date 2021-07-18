import { Plea } from '../types/plea';

let _pleas: Plea[] = [];

const getPleas = (): Plea[] => [..._pleas];

const addPlea = (plea: Plea): void => {
	const index = (_pleas || []).findIndex((p) => p.id === plea.id);

	if (index > -1) {
		_pleas[index] = plea;
	} else {
		_pleas.push(plea);
	}
};

const removePlea = (id: string): void => {
	_pleas = (_pleas || []).filter((plea) => plea.id !== id);
};

const clearPleas = (): void => {
	_pleas = [];
};

const setPleas = (pleas: Plea[]): void => {
	_pleas = [...pleas];
};

export { addPlea, clearPleas, getPleas, removePlea, setPleas };
