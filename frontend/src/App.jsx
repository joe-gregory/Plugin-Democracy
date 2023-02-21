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
import NotFound404 from "./pages/NotFound404";

import TestMessages from "./pages/TestMessages";

//context
import { AuthContext } from "./context/auth-context";
import { MessagesContext } from "./context/messages-context";
import { RequestContext } from "./context/requests-context";

import { v4 as uuid } from "uuid";

function App() {
	const [authenticated, setAuthenticated] = useState(false);
	const [alertMessages, setAlertMessages] = useState([]);
	const [requestOutput, setRequestOutput] = useState({});

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
		setAuthenticated(false);
	};

	//AlertMessages
	const setMessages = (messages) => {
		setAlertMessages(messages);
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
	async function request(method = "get", subdirectory = "/", body) {
		//fetches and returns json response
		method = method.toLowerCase();
		subdirectory = subdirectory.toLowerCase();
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
				headers: {
					"Content-Type": "application/json",
				},
				body: body,
				mode: "cors",
				credentials: "include",
			});

			output = await response.json();
			console.log("output in request in app: ", output);
		} catch (error) {
			output.success = false;
			output.messages.push({ severity: "error", message: error.message });
		}

		//Desmenuzando output. Rerouting output
		//authenticated status
		output.authenticated === true
			? setAuthenticated(true)
			: setAuthenticated(false);
		//NavBar alert messages
		if (output.messages) createAndSetMessage(output.messages);

		//The entire request output object
		setRequestOutput(output);
		return output;
	}

	const clearRequestOutput = () => {
		setRequestOutput({});
	};

	return (
		<CssBaseline>
			<RequestContext.Provider
				value={{
					output: requestOutput,
					request: request,
					clearOutput: clearRequestOutput,
				}}
			>
				<AuthContext.Provider
					value={{
						authenticated: authenticated,
						login: login,
						logout: logout,
					}}
				>
					<AuthChecker />
					<MessagesContext.Provider
						value={{
							messages: alertMessages,
							setMessages: setMessages,
							createAndAddMessage: createAndAddMessage,
							createAndSetMessage: createAndSetMessage,
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
									authenticated ? (
										<Community />
									) : (
										<Navigate to="/login" />
									)
								}
							/>
							<Route
								path="/login"
								element={
									authenticated ? (
										<Navigate to="/community" />
									) : (
										<LogIn />
									)
								}
							/>
							<Route
								path="/signup"
								element={
									authenticated ? (
										<Navigate to="/community" />
									) : (
										<SignUp />
									)
								}
							/>
							<Route
								path="/test-messages"
								element={<TestMessages />}
							/>
							<Route path="*" element={<NotFound404 />} />
						</Routes>
						<Footer />
					</MessagesContext.Provider>
				</AuthContext.Provider>
			</RequestContext.Provider>
		</CssBaseline>
	);
}

export default App;
