import { useContext, useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import { AuthContext } from "../context/auth-context";

export default function Home() {
	const [data, setData] = useState({ authenticated: false });

	const auth = useContext(AuthContext);

	useEffect(() => {
		async function fetchData() {
			const response = await fetch("https://192.168.1.68:8080/", {
				mode: "cors",
				credentials: "include",
			});
			const responseData = await response.json();
			console.log("Home Auth: ", responseData.authenticated);
			setData(responseData);
			if (responseData.authenticated === true) auth.login();
		}

		fetchData();
	}, []);

	return (
		<Container>
			<Typography variant="h1">At Home Page</Typography>
			<Typography>
				Authenticated: {data.authenticated.toString()}
			</Typography>
		</Container>
	);
}
