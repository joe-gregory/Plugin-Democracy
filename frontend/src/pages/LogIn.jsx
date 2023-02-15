import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../context/auth-context";

export default function LogIn() {
	const [loading, setLoading] = React.useState(false);

	const auth = React.useContext(AuthContext);

	const handleSubmit = async (event) => {
		setLoading(true);
		event.preventDefault();

		const data = new FormData(event.currentTarget);

		try {
			const response = await fetch("https://192.168.1.68:8080/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: data.get("email"),
					password: data.get("password"),
				}),
				mode: "cors",
				credentials: "include",
			});

			const responseData = await response.json();
			console.log(responseData);
			if (responseData.authenticated === true) auth.login();
			setLoading(false);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				{loading ? (
					<CircularProgress />
				) : (
					<Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
						<LockOutlinedIcon />
					</Avatar>
				)}
				<Typography component="h1" variant="h5">
					Acceder
				</Typography>
				<Box
					component="form"
					onSubmit={handleSubmit}
					noValidate
					sx={{ mt: 1 }}
				>
					<TextField
						margin="normal"
						required
						fullWidth
						id="email"
						label="Correo Electronico"
						name="email"
						autoComplete="email"
						autoFocus
					/>
					<TextField
						margin="normal"
						required
						fullWidth
						name="password"
						label="Contraseña"
						type="password"
						id="password"
						autoComplete="current-password"
					/>
					<FormControlLabel
						control={<Checkbox value="remember" color="primary" />}
						label="Remember me"
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
					>
						Acceder
					</Button>
					<Grid container>
						<Grid item xs>
							<Link href="#" variant="body2">
								¿Olvidaste tu contraseña?
							</Link>
						</Grid>
						<Grid item>
							<Link href="/signup" variant="body2">
								{"¿No tienes cuenta? Registrate"}
							</Link>
						</Grid>
					</Grid>
				</Box>
			</Box>
			<Copyright sx={{ mt: 8, mb: 4 }} />
		</Container>
	);
}

function Copyright(props) {
	return (
		<Typography
			variant="body2"
			color="text.secondary"
			align="center"
			{...props}
		>
			{"Copyright © "}
			<Link color="inherit" href="/">
				Plugin Democracy
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
}
