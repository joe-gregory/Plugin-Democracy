import { createContext } from "react";

const EmailConfirmContext = createContext({
	emailConfirm: false,
	confirmEmail: () => {},
	unconfirmEmail: () => {},
});

export { EmailConfirmContext };
