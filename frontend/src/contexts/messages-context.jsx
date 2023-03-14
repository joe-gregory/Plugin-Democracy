import { createContext } from "react";

const MessagesContext = createContext({
	messages: [],
	setMessages: () => {},
	createAndAddMessage: () => {},
	createAndSetMessage: () => {},
	returnUUIDMessage: () => {},
	clearMessages: () => {},
});

export { MessagesContext };
