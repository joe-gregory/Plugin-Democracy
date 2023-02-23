import { createContext } from "react";

const RequestContext = createContext({
	request: () => {},
});

export { RequestContext };
