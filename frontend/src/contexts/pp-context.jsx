import { createContext } from "react";

const PPContext = createContext({
	pp: undefined,
	ppUpdate: () => {},
});

export { PPContext };
