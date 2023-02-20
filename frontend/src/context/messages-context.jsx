import { createContext } from "react";

const MessagesContext = createContext({
	messages: [],
	setMessages: () => {},
	clearMessages: () => {},
});

export { MessagesContext };
