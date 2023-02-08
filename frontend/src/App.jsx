//CSS
import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";

//React
import { useState, useCallback } from "react";

//Routes
import { Routes, Route, Navigate } from "react-router-dom";

//Components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

//Pages
import Home from "./pages/Home";
import Community from "./pages/Community";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import NotFound404 from "./pages/NotFound404";

//context
import { AuthContext } from "./context/auth-context";

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const login = useCallback(() => {
		setIsLoggedIn(true);
	}, []);

	const logout = useCallback(() => {
		setIsLoggedIn(false);
	}, []);

	return (
		<CssBaseline>
			<AuthContext.Provider
				value={{ isLoggedIn: isLoggedIn, login: login, logout: logout }}
			>
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
			</AuthContext.Provider>
		</CssBaseline>
	);
}

export default App;
