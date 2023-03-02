import { useState, useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Container from "@mui/material/Container";
import Badge from "@mui/material/Badge";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";

import { Link } from "react-router-dom";

import { RequestContext } from "../context/requests-context";
import { CitizenContext } from "../context/citizen-context";

export default function Account() {
	const request = useContext(RequestContext);
	const citizenContext = useContext(CitizenContext);
	let citizen = citizenContext.citizen;

	useEffect(() => {
		async function getCitizenInfo() {
			const output = await request.request("get", "/account");
		}
		getCitizenInfo();
	}, []);

	const confirmEmail = () => {
		request.request("get", "/sendconfirmationemail");
	};

	return (
		<Container component="main">
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography component="h1" variant="h3">
					Cuenta
				</Typography>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<ProfilePicture />
				<Typography>{citizen ? citizen.fullName : ""}</Typography>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				<Typography>
					<b>Fecha de Nacimiento: </b>
					{citizen ? citizen.dob.split("T")[0] : ""}
				</Typography>
				<Typography>
					<b>Correo electronico: </b>
					{citizen ? citizen.email : ""}
				</Typography>
				<Typography>
					<b>Correo electronico confirmado: </b>{" "}
					{citizen ? (citizen.emailConfirm ? "Si" : "No") : "No"}
					{citizen ? (
						citizen.emailConfirm ? (
							<Button
								type="submit"
								fullWidth
								variant="contained"
								onClick={confirmEmail}
							>
								Reenviar correo
							</Button>
						) : (
							""
						)
					) : (
						""
					)}
				</Typography>
				<Typography>
					<b>Celular: </b>
					{citizen
						? citizen.cellPhone
							? citizen.cellPhone
							: ""
						: ""}
				</Typography>
				<Typography>
					<b>Cuenta creada en: </b>

					{citizen
						? citizen.createdAt
							? citizen.createdAt.split("T")[0]
							: ""
						: ""}
				</Typography>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography component="h1" variant="h4">
					Comunidades
				</Typography>
			</Box>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				{citizen
					? citizen.communities
						? citizen.communities.map((community) => (
								<Typography
									component="h1"
									variant="h6"
									key={community._id}
								>
									<Link
										to={"/community/about/" + community._id}
									>
										{community.name}
									</Link>
								</Typography>
						  ))
						: ""
					: ""}
			</Box>
		</Container>
	);
}

function ProfilePicture() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [file, setFile] = useState(null);
	const request = useContext(RequestContext);
	const citizenContext = useContext(CitizenContext);
	let citizen = citizenContext.citizen;

	const handleClickOpen = () => {
		setDialogOpen(true);
	};

	const handleClose = () => {
		setDialogOpen(false);
	};

	const handleFileChange = (event) => {
		setFile(event.target.files[0]);
	};

	const handleUploadClick = async (event) => {
		event.preventDefault();
		setDialogOpen(false);

		if (!file) {
			return;
		}

		const formData = new FormData();
		formData.append("profilePicture", file);
		formData.append("enctype", "multipart/form-data");

		let output = await request.request(
			"post",
			"/profilepicture",
			{},
			formData
		);
	};

	return (
		<>
			<Button onClick={handleClickOpen}>
				<Badge
					overlap="circular"
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "right",
					}}
					badgeContent={<CameraAltIcon sx={{ color: "#B2BEB5" }} />}
				>
					<Avatar
						alt={citizen ? citizen.firstName : "C"}
						key={citizen._id}
						src="https://localhost:8080/profile-picture"
						sx={{ width: 156, height: 156 }}
					/>
				</Badge>
			</Button>
			<Dialog open={dialogOpen} onClose={handleClose}>
				<DialogTitle>Sube una foto de perfil</DialogTitle>
				<Input
					type="file"
					name="profilePicture"
					accept="image/*"
					onChange={handleFileChange}
				/>
				<Button onClick={handleUploadClick}>Subir</Button>
			</Dialog>
		</>
	);
}
