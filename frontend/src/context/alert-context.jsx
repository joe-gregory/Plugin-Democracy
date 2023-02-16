import { createContext } from "react";

const AlertContext = createContext({
	alertMessages: [],
	setAlertMessages: () => {},
	clearAlertMessages: () => {},
});

export { AlertContext };
