import { useContext, useEffect } from "react";
//import { request } from "../utilities";
import { AuthContext } from "../context/auth-context";
import { RequestContext } from "../context/requests-context";

export default function AuthChecker(props) {
	const auth = useContext(AuthContext);
	const request = useContext(RequestContext);

	useEffect(() => {
		async function checkAuthStatus() {
			try {
				const response = await request.request(
					"get",
					"/session-status"
				);
				if (response.authenticated === true) {
					auth.login();
					console.log("/session-status report: loggedin");
				} else {
					auth.logout();
					console.log("/session-status report: loggedout");
				}
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
