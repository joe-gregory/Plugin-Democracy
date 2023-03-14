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
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";

import { Link } from "react-router-dom";

import { RequestContext } from "../contexts/requests-context";
import { CitizenContext } from "../contexts/citizen-context";
import JoinBadge from "../assets/joinBadge.png";
import AccountImage from "../assets/account.png";
import { PPContext } from "../contexts/pp-context";

export default function Account() {
	const request = useContext(RequestContext);
	const citizenContext = useContext(CitizenContext);
	let citizen = citizenContext.citizen;
	const ppContext = useContext(PPContext);

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
					Profile
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
				<ProfilePicture key={ppContext.pp} />
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
					<b>DOB: </b>
					{citizen ? citizen.dob.split("T")[0] : ""}
				</Typography>
				<Typography>
					<b>email: </b>
					{citizen ? citizen.email : ""}
				</Typography>
				<Typography>
					<b>email confirmed?: </b>{" "}
					{citizen ? (citizen.emailConfirm ? "Yes" : "No") : "No"}
					{citizen ? (
						!citizen.emailConfirm ? (
							<Button
								type="submit"
								fullWidth
								variant="contained"
								onClick={confirmEmail}
							>
								Resend email
							</Button>
						) : (
							""
						)
					) : (
						""
					)}
				</Typography>
				<Typography>
					<b>Cellphone: </b>
					{citizen
						? citizen.cellPhone
							? citizen.cellPhone
							: ""
						: ""}
				</Typography>
				<Typography>
					<b>Account created on: </b>

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
					Communities
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
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography component="h1" variant="h4">
					Badges
				</Typography>
			</Box>
			{citizen &&
			citizen.communities &&
			citizen.communities.length > 0 ? (
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "start",
					}}
				>
					<Grid
						container
						alignItems="center"
						spacing={2}
						direction="column"
					>
						<Grid item>
							<Avatar src={JoinBadge} />
						</Grid>
						<Grid item>
							<Typography variant="subtitle1">
								Joined a community
							</Typography>
						</Grid>
					</Grid>
				</Box>
			) : (
				""
			)}
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				<img src={AccountImage} style={{ width: "100vw" }}></img>
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
	let ppContext = useContext(PPContext);
	let profilepiclink = "/profilepicture";

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
			profilepiclink,
			{},
			formData
		);
		ppContext.ppUpdate();
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
						key={citizen ? citizen._id : "C"}
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
