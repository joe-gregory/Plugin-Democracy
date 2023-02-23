import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";

import { RequestContext } from "../context/requests-context";
import Copyright from "../components/Copyright";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { MessagesContext } from "../context/messages-context";

export default function SignUp() {
	const request = React.useContext(RequestContext);
	const messages = React.useContext(MessagesContext);
	const [phoneValue, setPhoneValue] = React.useState("");
	const [phoneInfo, setPhoneInfo] = React.useState("");
	const [loading, setLoading] = React.useState(false);

	const handleSubmit = (event) => {
		setLoading(true);
		event.preventDefault();
		const data = new FormData(event.currentTarget);

		//frontend checks
		let frontEndChecks = true;
		let formMessages = [];

		if (data.get("firstName") === "") {
			frontEndChecks = false;
			formMessages.push({
				severity: "warning",
				message: "Falta nombre",
			});
		}

		if (data.get("lastName") === "") {
			frontEndChecks = false;
			formMessages.push({
				severity: "warning",
				message: "Falta primer apellido",
			});
		}

		if (data.get("dob") === "") {
			frontEndChecks = false;
			formMessages.push({
				severity: "warning",
				message: "Falta fecha de nacimiento",
			});
		}

		if (data.get("email") === "") {
			frontEndChecks = false;
			formMessages.push({
				severity: "warning",
				message: "Falta correo electronico",
			});
		}

		if (data.get("password") === "") {
			frontEndChecks = false;
			formMessages.push({
				severity: "warning",
				message: "Falta contraseña",
			});
		}

		if (data.get("confirmPassword") === "") {
			frontEndChecks = false;
			formMessages.push({
				severity: "warning",
				message: "Falta confirmar contraseña",
			});
		}

		if (data.get("password").length < 7) {
			frontEndChecks = false;
			formMessages.push({
				severity: "warning",
				message: "Contraseña ocupa minimo 7 caracteres",
			});
		}

		if (data.get("password") !== data.get("confirmPassword")) {
			frontEndChecks = false;
			formMessages.push({
				severity: "warning",
				message: "Las contraseñas no coinciden",
			});
		}

		if (!matchIsValidTel(phoneValue)) {
			frontEndChecks = false;
			formMessages.push({
				severity: "warning",
				message: "Numero de celular invalido",
			});
		}

		messages.createAndSetMessage(formMessages);

		if (frontEndChecks) {
			let body = JSON.stringify({
				firstName: data.get("firstName"),
				lastName: data.get("lastName"),
				secondLastName: data.get("secondLastName"),
				dob: data.get("dob"),
				email: data.get("email"),
				password: data.get("password"),
				confirmPassword: data.get("confirmPassword"),
				cellPhone:
					"+" +
					phoneInfo.countryCallingCode +
					" " +
					data.get("cellPhone"),
			});

			let output = request.request("post", "signup", body);
		}
	};

	function handlePhoneChange(newValue, info) {
		setPhoneValue(newValue);
		setPhoneInfo(info);
	}

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				{loading ? (
					<CircularProgress />
				) : (
					<Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
						<PowerOutlinedIcon />
					</Avatar>
				)}
				<Typography component="h1" variant="h5">
					Inscríbete
				</Typography>
				<Box
					component="form"
					noValidate
					onSubmit={handleSubmit}
					sx={{ mt: 3 }}
				>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<TextField
								autoComplete="given-name"
								name="firstName"
								required
								fullWidth
								id="firstName"
								label="Nombre"
								autoFocus
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								required
								fullWidth
								id="lastName"
								label="Primer Apellido"
								name="lastName"
								autoComplete="family-name"
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								id="secondLastName"
								label="Segundo Apellido"
								name="secondLastName"
								autoComplete="family-name"
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								required
								id="dob"
								name="dob"
								label="Fecha de Nacimiento"
								type="date"
								defaultValue=""
								sx={{ width: 220 }}
								InputLabelProps={{
									shrink: true,
								}}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								id="email"
								label="Email Address"
								name="email"
								autoComplete="email"
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								name="password"
								label="Contraseña"
								type="password"
								id="password"
								autoComplete="new-password"
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								name="confirmPassword"
								label="Confirmar contraseña"
								type="password"
								id="confirmPassword"
								autoComplete="confirm-new-password"
							/>
						</Grid>
						<Grid item xs={12}>
							<MuiTelInput
								value={phoneValue}
								forceCallingCode="true"
								defaultCountry="MX"
								onlyCountries={["MX", "US"]}
								onChange={handlePhoneChange}
								required
								id="cellPhone"
								name="cellPhone"
								helperText="Numero celular requerido"
							/>
						</Grid>
						{/*<Grid item xs={12}>
							<FormControlLabel
								control={
									<Checkbox
										value="allowExtraEmails"
										color="primary"
									/>
								}
								label="I want to receive inspiration, marketing promotions and updates via email."
							/>
							</Grid>*/}
					</Grid>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
					>
						Inscribete
					</Button>
					<Grid container justifyContent="flex-end">
						<Grid item>
							<Link href="/login" variant="body2">
								¿Ya posees una cuenta? Accede aqui
							</Link>
						</Grid>
					</Grid>
				</Box>
			</Box>
			<Copyright sx={{ mt: 5 }} />
		</Container>
	);
}
