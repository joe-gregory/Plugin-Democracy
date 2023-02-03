import logo from "./logo.svg";
import "./App.css";

import { Routes, Route, Link } from "react-router-dom";

import { useState, useEffect } from "react";

//Components
import MenuAppBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer";

//Pages
import Home from "./pages/Home";
import Community from "./pages/Community";
import SignIn from "./pages/SignIn";

function App() {
	return (
		<>
			<MenuAppBar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/community" element={<Community />} />
				<Route path="/signin" element={<SignIn />} />
			</Routes>
			<Footer />
		</>
	);
}

export default App;
