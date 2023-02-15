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

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [alertMessage, setAlertMessage] = useState([]);

	const login = useCallback(() => {
		setIsLoggedIn(true);
	}, []);

	const logout = useCallback(() => {
		setIsLoggedIn(false);
	}, []);

	/*useEffect(() => {
		async function fetchStatus() {
			const response = await fetch(
				"http://localhost:8080/session-status",
				{
					mode: "cors",
				}
			);
			const responseData = await response.json();
			console.log("Session-status: ", responseData.isAuthenticated);
			setIsLoggedIn(responseData.isAuthenticated);
		}

		fetchStatus();
	}); /*
	useEffect(() => {
		async function fetchStatus() {
			const response = await fetch(
				"http://localhost:8080/session-status"
			);
			const responseData = await response.json();
			console.log("SeSSion-StatUs : ", responseData.isAuthenticated);
			setIsLoggedIn(responseData.isAuthenticated);
		}
		fetchStatus();

		/*
		fetch("http://localhost:8080/session-status")
			.then((response) => {
				response.json().then((data) => {
					console.log("session-status ", data.isAuthenticated);
					setIsLoggedIn(data.isAuthenticated);
				});
			})
			.catch((error) => console.error(error));
	});*/

	return (
		<CssBaseline>
			<AuthContext.Provider
				value={{ isLoggedIn: isLoggedIn, login: login, logout: logout }}
			>
				<AuthChecker>
					<NavBar />
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
				</AuthChecker>
			</AuthContext.Provider>
		</CssBaseline>
	);
}

export default App;
