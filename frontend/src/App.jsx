//CSS
import CssBaseline from "@mui/material/CssBaseline";

//React
import { useState, useCallback, useEffect } from "react";

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

//context
import { AuthContext } from "./context/auth-context";
import { AlertContext } from "./context/alert-context";
import { RequestContext } from "./context/requests-context";

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [alertMessages, setAlertMessages] = useState([]);
	const [requestOutput, setRequestOutput] = useState({});

	useEffect(() => {
		async function getSession() {
			const response = await request("get", "/session-status");
			response.authenticated ? setIsLoggedIn(true) : setIsLoggedIn(false);
		}
		getSession();
	}, []);

	//AuthContext
	const login = () => {
		setIsLoggedIn(true);
	};

	const logout = () => {
		setIsLoggedIn(false);
	};

	//AlertMessages
	const setMessages = (messages) => {
		setAlertMessages(messages);
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
		const domain = "https://192.168.1.68:8080";
		const url = domain + subdirectory;

		let output = {};
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
			output.messages.push({ type: "error", message: error.message });
		}

		//Desmenuzando
		console.log(output);
		output.authenticated === true
			? setIsLoggedIn(true)
			: setIsLoggedIn(false);
		if (output.messages) setMessages(output.messages);
		console.log("Messags : ", alertMessages); //DEL

		//Output Reroutes:
		setRequestOutput(output);
		console.log("requestOutput: ", requestOutput);
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
						isLoggedIn: isLoggedIn,
						login: login,
						logout: logout,
					}}
				>
					{/*<AuthChecker />*/}
					<AlertContext.Provider
						value={{
							alertMessages: alertMessages,
							setAlertMessages: setMessages,
							clearAlertMessages: clearMessages,
						}}
					>
						<NavBar />
					</AlertContext.Provider>

					<Routes>
						<Route path="/" element={<Home />} />
						<Route
							path="/community"
							element={
								isLoggedIn ? (
									<Community />
								) : (
									<Navigate to="/login" />
								)
							}
						/>
						<Route
							path="/login"
							element={
								isLoggedIn ? (
									<Navigate to="/community" />
								) : (
									<LogIn />
								)
							}
						/>
						<Route
							path="/signup"
							element={
								isLoggedIn ? (
									<Navigate to="/community" />
								) : (
									<SignUp />
								)
							}
						/>
						<Route path="*" element={<NotFound404 />} />
					</Routes>
					<Footer />
				</AuthContext.Provider>
			</RequestContext.Provider>
		</CssBaseline>
	);
}

export default App;
