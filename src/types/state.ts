import { Plea } from './plea';

class Ignored {
	constructor(public readonly pleaId: string, public readonly userId: string) {}
}

class Pitied {
	constructor(
		public readonly pleaId: string,
		public readonly userId: string,
		public readonly sessionId: string
	) {}
}

type Pleading = Ignored | Pitied;

class Pitying {
	constructor(public readonly pleaId: string, public readonly sessionId: string) {}
}

class Idling {
	constructor() {}
}

type UserState = Pleading | Pitying | Idling;

type PropilotState = {
	isPro: boolean;
	state: UserState;
	handle: string;
	pleas: Plea[];
};

type StateListener = (oldState: PropilotState, newState: PropilotState) => void;

export { PropilotState, Pleading, Pitying, Idling, Ignored, Pitied, UserState, StateListener };
