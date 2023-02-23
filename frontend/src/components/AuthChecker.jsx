import { useContext, useEffect } from "react";
//import { request } from "../utilities";
import { AuthContext } from "../context/auth-context";
import { RequestContext } from "../context/requests-context";
import { EmailConfirmContext } from "../context/confirmed-email-context";

export default function AuthChecker(props) {
	const auth = useContext(AuthContext);
	const request = useContext(RequestContext);
	const emailConfirm = useContext(EmailConfirmContext);

	useEffect(() => {
		async function checkAuthStatus() {
			try {
				const output = await request.request("get", "/session-status");
				if (output.authenticated === true) {
					auth.login();
				} else {
					auth.logout();
				}
				if (output.emailConfirm === true) emailConfirm.confirmEmail();
				else emailConfirm.unconfirmEmail();
				console.log(
					`/session-status report: auth: ${output.authenticated}, emailConf: ${output.emailConfirm}`
				);
			} catch (error) {
				console.error("Error checking authentication status: ", error);
			}
		}

		const checkInterval = setInterval(checkAuthStatus, 5000);

		return () => {
			clearInterval(checkInterval);
		};
	}, [auth]);
	return props.children;
}
