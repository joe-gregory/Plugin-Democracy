import { useParams } from "react-router-dom";

import { useState, useContext, useEffect } from "react";

import { RequestContext } from "../context/requests-context";
import { EmailConfirmContext } from "../context/confirmed-email-context";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import CheckIcon from "@mui/icons-material/Check";

export default function VerifyEmail() {
	const { jwt } = useParams();
	const [confirmed, setConfirmed] = useState(false);
	const request = useContext(RequestContext);
	const emailConfirm = useContext(EmailConfirmContext);

	useEffect(() => {
		let output = request.request("get", `/verifyemail/${jwt}`);
		if (output.success === true) {
			emailConfirm.confirmEmail();
			request.request("get", "/logout");
			setConfirmed(true);
		}
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
