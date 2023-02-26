import { useState, useContext } from "react";

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

import { RequestContext } from "../context/requests-context";

export default function Account() {
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
				<Typography component="h1" variant="h4">
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
				<Typography>Nombre del usuario</Typography>
			</Box>
		</Container>
	);
}

function ProfilePicture() {
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState(null);
	const request = useContext(RequestContext);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleFileChange = (event) => {
		setFile(event.target.files[0]);
	};

	const handleUploadClick = async (event) => {
		event.preventDefault();

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
						alt="C"
						src="https://localhost:8080/profile-picture"
						sx={{ width: 156, height: 156 }}
					/>
				</Badge>
			</Button>
			<Dialog open={open} onClose={handleClose}>
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