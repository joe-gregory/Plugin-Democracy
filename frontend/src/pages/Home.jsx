import { useContext, useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import { AuthContext } from "../context/auth-context";
import { RequestContext } from "../context/requests-context";

export default function Home() {
	const auth = useContext(AuthContext);
	const request = useContext(RequestContext);
	let output;

	useEffect(() => {
		output = request.request("get", "/");
	}, []);

	return (
		<Container>
			<Typography variant="h1">At Home Page</Typography>
			<Typography>
				server.authenticated:{" "}
				{output ? output.authenticated.toString() : "false"}
			</Typography>
			<Typography>
				auth.authenticated: {auth.authenticated.toString()}
			</Typography>
		</Container>
	);
}
