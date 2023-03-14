import { createContext } from "react";

const UpdateContext = createContext({
	update: undefined,
	updateUpdate: () => {},
});

export { UpdateContext };
