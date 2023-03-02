//CSS
import CssBaseline from "@mui/material/CssBaseline";

//React
import { useState, useEffect } from "react";

//Routes
import { Routes, Route, Navigate } from "react-router-dom";

//Components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import AuthChecker from "./components/AuthChecker";

//Pages
import Home from "./pages/Home";
import Community from "./pages/Community";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";
import Account from "./pages/Account";
import AboutCommunity from "./pages/AboutCommunity";
import NotFound404 from "./pages/NotFound404";

import TestMessages from "./pages/TestMessages";

//context
import { AuthContext } from "./context/auth-context";
import { MessagesContext } from "./context/messages-context";
import { RequestContext } from "./context/requests-context";
import { EmailConfirmContext } from "./context/confirmed-email-context";
import { CitizenContext } from "./context/citizen-context";
import { CommunitiesContext } from "./context/communities-context";

import { v4 as uuid } from "uuid";

function App() {
	const [authenticated, setAuthenticated] = useState(false);
	const [emailConfirm, setEmailConfirm] = useState(false);
	const [alertMessages, setAlertMessages] = useState([]);
	const [citizen, setCitizen] = useState(undefined);
	const [communities, setCommunities] = useState([]);

	useEffect(() => {
		async function getSession() {
			const output = await request("get", "/session-status");
			output.authenticated
				? setAuthenticated(true)
				: setAuthenticated(false);
			console.log("app initial authenticated: ", output.authenticated);
		}
		getSession();
	}, []);

	//AuthContext
	const login = () => {
		setAuthenticated(true);
	};

	const logout = () => {
		setCitizen(undefined);
		setAuthenticated(false);
	};

	//AlertMessages
	const setMessages = (messages) => {
		setAlertMessages(messages);
	};

	//ConfirmEmailContext
	const confirmEmail = () => {
		setEmailConfirm(true);
	};

	const unconfirmEmail = () => {
		setEmailConfirm(false);
	};

	const returnUUIDMessage = ({ severity = "success", message = "" }) => {
		let key = uuid();
		message = {
			severity: severity,
			message: message,
			key: key,
		};
		return message;
	};

	const createAndAddMessage = (messages) => {
		if (Array.isArray(messages)) {
			for (let i = 0; i < messages.length; i++) {
				if (!messages[i].severity) messages[i].severity = "success";
				if (!messages[i].key) messages[i].key = uuid();
				if (!messages[i].message) messages[i].message = "";
			}
			setAlertMessages([...alertMessages, ...messages]);
		} else {
			let message = {
				severity: messages.severity ? messages.severity : "success",
				message: messages.message ? messages.message : "",
				key: messages.key ? messages.key : uuid(),
			};
			setAlertMessages([...alertMessages, message]);
		}
	};

	const createAndSetMessage = (messages) => {
		if (Array.isArray(messages)) {
			for (let i = 0; i < messages.length; i++) {
				if (!messages[i].severity) messages[i].severity = "success";
				if (!messages[i].key) messages[i].key = uuid();
				if (!messages[i].message) messages[i].message = "";
			}
			setAlertMessages([...messages]);
		} else {
			let message = {
				severity: messages.severity ? messages.severity : "success",
				message: messages.message ? messages.message : "",
				key: messages.key ? messages.key : uuid(),
			};
			setAlertMessages([message]);
		}
	};
	const clearMessages = () => {
		setAlertMessages([]);
	};

	//RequestContext
	async function request(
		method = "get",
		subdirectory = "/",
		headers = {
			"Content-Type": "application/json",
		},
		body
	) {
		//fetches and returns json response

		method = method.toLowerCase();
		//subdirectory = subdirectory.toLowerCase();
		if (subdirectory[0] !== "/") subdirectory = "/" + subdirectory;
		let methods = ["get", "post"];
		if (!methods.includes(method)) throw new Error("Unknown http method");
		const domain = "https://localhost:8080";
		const url = domain + subdirectory;

		let output = {};
		output.messages = [];

		try {
			const response = await fetch(url, {
				method: method,
				headers: headers,
				body: body,
				mode: "cors",
				credentials: "include",
			});
			output = response;
		} catch (error) {
			output.success = false;
			output.messages.push({
				severity: "error",
				message: "Error in fetch at app.jsx: " + error.message,
			});
			console.log(error);
		}
		try {
			output = await output.json();
			console.log("App.jsx output of request: ", output);
		} catch (error) {
			console.log("error converting to Json. ", error);
		}

		//Desmenuzando output. Rerouting output
		//isAuthenticated?
		if (output.authenticated === true) login();
		else if (output.authenticated === false) logout();
		//is emailConfirm?
		if (output.emailConfirm === true) confirmEmail();
		else if (output.emailConfirm === false) unconfirmEmail();
		//RR NavBar alert messages
		if (output.messages) createAndAddMessage(output.messages);
		//Citizen info
		if (output.citizen) setCitizen(output.citizen);
		//Communities info
		if (output.communities) setCommunities(output.communities);

		//The entire request output object
		return output;
	}

	return (
		<CssBaseline>
			<RequestContext.Provider value={{ request: request }}>
				<AuthContext.Provider
					value={{
						authenticated: authenticated,
						login: login,
						logout: logout,
					}}
				>
					<CitizenContext.Provider value={{ citizen: citizen }}>
						<CommunitiesContext.Provider
							value={{ communities: communities }}
						>
							<EmailConfirmContext.Provider
								value={{
									emailConfirm: emailConfirm,
									confirmEmail: confirmEmail,
									unconfirmEmail: unconfirmEmail,
								}}
							>
								<AuthChecker />
								<MessagesContext.Provider
									value={{
										messages: alertMessages,
										setMessages: setMessages,
										createAndAddMessage:
											createAndAddMessage,
										createAndSetMessage:
											createAndSetMessage,
										returnUUIDMessage: returnUUIDMessage,
										clearMessages: clearMessages,
									}}
								>
									<NavBar />
									<Routes>
										<Route path="/" element={<Home />} />
										<Route
											path="/community"
											element={
												authenticated &&
												emailConfirm ? (
													<Community />
												) : authenticated &&
												  !emailConfirm ? (
													<Navigate to="/account" />
												) : (
													<Navigate to="/login" />
												)
											}
										/>
										<Route
											path="/login"
											element={
												authenticated &&
												emailConfirm ? (
													<Navigate to="/community" />
												) : authenticated &&
												  !emailConfirm ? (
													<Navigate to="/account" />
												) : (
													<LogIn />
												)
											}
										/>
										<Route
											path="/signup"
											element={
												authenticated &&
												emailConfirm ? (
													<Navigate to="/community" />
												) : authenticated &&
												  !emailConfirm ? (
													<Navigate to="/account" />
												) : (
													<SignUp />
												)
											}
										/>
										<Route
											path="/verifyemail"
											element={<VerifyEmail />}
										/>
										<Route
											path="/account"
											element={
												authenticated ? (
													<Account />
												) : (
													<Navigate to="/login" />
												)
											}
										/>
										<Route
											path="/community/about"
											element={
												authenticated ? (
													<AboutCommunity />
												) : (
													<Navigate to="/login" />
												)
											}
										/>
										<Route
											path="/test-messages"
											element={<TestMessages />}
										/>
										<Route
											path="*"
											element={<NotFound404 />}
										/>
									</Routes>
									<Footer />
								</MessagesContext.Provider>
							</EmailConfirmContext.Provider>
						</CommunitiesContext.Provider>
					</CitizenContext.Provider>
				</AuthContext.Provider>
			</RequestContext.Provider>
		</CssBaseline>
	);
}

export default App;
