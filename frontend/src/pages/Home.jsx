import { useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";

export default function Home() {
	const [data, setData] = useState({ isAuthenticated: false });

	useEffect(() => {
		async function fetchData() {
			const response = await fetch("http://localhost:8080/");
			const responseData = await response.json();
			console.log("Home Auth: ", responseData.isAuthenticated);
			setData(responseData);
		}

		fetchData();
	});

	return (
		<Container>
			<Typography variant="h1">At Home Page</Typography>
			<Typography>
				Authenticated: {data.isAuthenticated.toString()}
			</Typography>
		</Container>
	);
}
