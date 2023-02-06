import "./App.css";

import { Routes, Route, Link } from "react-router-dom";

import { useState, useEffect } from "react";

//Components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

//Pages
import Home from "./pages/Home";
import Community from "./pages/Community";
import SignIn from "./pages/SignIn";

function App() {
	return (
		<>
			<NavBar />
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
