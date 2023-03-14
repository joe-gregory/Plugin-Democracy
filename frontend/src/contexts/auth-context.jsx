import { createContext } from "react";

const AuthContext = createContext({
	authenticated: false,
	login: () => {},
	logout: () => {},
});

export { AuthContext };
