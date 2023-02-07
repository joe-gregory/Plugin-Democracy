import "./App.css";

import { Routes, Route, Link } from "react-router-dom";

import { useState, useEffect } from "react";

//Components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

//Pages
import Home from "./pages/Home";
import Community from "./pages/Community";
import LogIn from "./pages/LogIn";

function App() {
	return (
		<>
			<NavBar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/community" element={<Community />} />
				<Route path="/login" element={<LogIn />} />
			</Routes>
			<Footer />
		</>
	);
}

export default App;
