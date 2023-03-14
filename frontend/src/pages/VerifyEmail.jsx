import { useSearchParams, useNavigate } from "react-router-dom";

import { useState, useContext, useEffect } from "react";

import { RequestContext } from "../contexts/requests-context";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import CheckIcon from "@mui/icons-material/Check";

export default function VerifyEmail() {
	const [searchParams] = useSearchParams();
	const jwt = searchParams.get("jwt");
	const [confirmed, setConfirmed] = useState(false);
	const request = useContext(RequestContext);
	const navigate = useNavigate();

	useEffect(() => {
		let output = request.request("get", `/verifyemail?jwt=${jwt}`);
		if (output.success === true) {
			setConfirmed(true);
		}
		request.request("post", "/logout");
		navigate("/login");
	}, []);

	return (
		<>
			<Box
				sx={{
					marginTop: 4,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography variant="h5">
					Verificando tu correo electronico
				</Typography>
			</Box>
			<Box
				sx={{
					marginTop: 4,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				{confirmed ? (
					<Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
						<CheckIcon />
					</Avatar>
				) : (
					<CircularProgress />
				)}
			</Box>
		</>
	);
}
