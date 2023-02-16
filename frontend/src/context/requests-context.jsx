import { createContext } from "react";

const RequestContext = createContext({
	output: {},
	request: () => {},
	clearOutput: () => {},
});

export { RequestContext };
