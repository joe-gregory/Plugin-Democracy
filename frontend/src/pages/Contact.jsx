import {
	Box,
	TextField,
	Button,
	Grid,
	Container,
	Typography,
} from "@mui/material";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";

import { RequestContext } from "../contexts/requests-context";
import { useContext } from "react";
import Image from "../assets/aboutCommunity3.png";

export default function Contact() {
	const request = useContext(RequestContext);

	const handleSubmit = async (event) => {
		event.preventDefault();

		const data = new FormData(event.currentTarget);

		let body = JSON.stringify({
			title: data.get("title"),
			message: data.get("message"),
			email: data.get("email"),
		});

		request.request("post", "/contact", undefined, body);
	};

	return (
		<Container>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography
					variant="h3"
					sx={{ textDecoration: "", color: "primary.main" }}
				>
					Support
				</Typography>
				<PowerOutlinedIcon
					sx={{ color: "primary.main", fontSize: 40 }}
				/>
			</Box>
			<Box
				component="form"
				onSubmit={handleSubmit}
				noValidate
				sx={{ mt: 1 }}
			>
				<TextField
					margin="normal"
					fullWidth
					id="title"
					label="Title"
					name="title"
					autoComplete="title"
					autoFocus
				/>
				<TextField
					margin="normal"
					required
					fullWidth
					name="message"
					label="Message"
					id="message"
					autoComplete="message"
					multiline="true"
					minRows="10"
				/>
				<TextField
					margin="normal"
					required
					fullWidth
					id="email"
					label="email"
					name="email"
					autoComplete="email"
					autoFocus
				/>

				<Button
					type="submit"
					fullWidth
					variant="contained"
					sx={{ mt: 3, mb: 2 }}
				>
					Send
				</Button>
				<img src={Image} style={{ width: "100vw" }} />
			</Box>
		</Container>
	);
}
