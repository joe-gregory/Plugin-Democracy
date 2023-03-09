import { useEffect, useState, useContext } from "react";
import {
	Typography,
	Container,
	Box,
	CircularProgress,
	FormControl,
	Select,
	MenuItem,
	InputLabel,
	Link,
	Avatar,
	Button,
} from "@mui/material";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import joinCommunityImage from "../assets/joinCommunity.png";
import { RequestContext } from "../context/requests-context";

export default function JoinCommunity() {
	const [communityOptions, setCommunityOptions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [selectedCommunity, setSelectedCommunity] = useState();
	const [selectedHouseNumber, setSelectedHouseNumber] = useState();
	const request = useContext(RequestContext);

	useEffect(() => {
		async function getCommunityOptions() {
			let output = await request.request("get", "/community/join");
			setCommunityOptions(output.communityOptions);
			setLoading(false);
		}

		getCommunityOptions();
	}, []);

	function handleSelectCommunity(event) {
		let community = communityOptions.find(
			(com) => com._id === event.target.value
		);
		setSelectedCommunity(community);
	}

	function handleSelectedHouseNumber(event) {
		setSelectedHouseNumber(event.target.value);
	}

	const handleSubmit = async (event) => {
		setLoading(true);
		event.preventDefault();

		const data = new FormData(event.currentTarget);
		let body = JSON.stringify({
			community: selectedCommunity,
			homeNumber: selectedHouseNumber,
			type: data.get("type"),
		});
		request.request("post", "/community/join", undefined, body);
		setLoading(false);
		setDisabled(true);
	};

	return (
		<Container component="main" maxWidth="xs">
			<Box
				component="form"
				noValidate
				onSubmit={handleSubmit}
				sx={{ mt: 3 }}
			>
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
						Join a Community
					</Typography>
					<Typography>
						Send your request to join an existing community. Your
						information will be sent to community administrators and
						you will receive an email when you are confirmed. You
						might be asked by further documentation by the
						community's administrators.
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
					<FormControl fullWidth>
						<InputLabel id="LabelCommunityOptions">
							Select your community from the list
						</InputLabel>
						<Select
							id="communityOptions"
							value={selectedCommunity}
							onChange={handleSelectCommunity}
							label="Select your community from the list"
							disabled={disabled}
						>
							{communityOptions.map((community) => (
								<MenuItem value={community._id}>
									{community.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
				<Box
					sx={{
						marginTop: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					{selectedCommunity ? (
						<FormControl fullWidth>
							<InputLabel id="LabelHouseNumbers">
								In which home do you reside or you own?
							</InputLabel>
							<Select
								id="houseNumber"
								value={selectedHouseNumber}
								onChange={handleSelectedHouseNumber}
								label="Select your home number from the list"
								disabled={disabled}
							>
								{selectedCommunity.homes.map((home) => (
									<MenuItem
										value={home.number}
										key={home._id}
									>
										{home.number}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					) : (
						""
					)}
				</Box>
				<Box
					sx={{
						marginTop: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					{selectedCommunity ? (
						<FormControl fullWidth>
							<InputLabel id="LabelHouseNumbers">
								Are you a home owner or resident?
							</InputLabel>
							<Select
								id="type"
								value={selectedHouseNumber}
								onChange={handleSelectedHouseNumber}
								label="Are you a home owner or resident?"
								disabled={disabled}
							>
								<MenuItem value="owner">Owner</MenuItem>
								<MenuItem value="resident">Resident</MenuItem>
							</Select>
						</FormControl>
					) : (
						""
					)}
				</Box>
				<Box
					sx={{
						marginTop: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
						disabled={disabled}
					>
						Send Request
					</Button>
				</Box>

				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Link href="/community/register" variant="body2">
						{"Don't see your community listed?"}
					</Link>
				</Box>
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<img
						src={joinCommunityImage}
						style={{ width: "100vw" }}
					></img>
				</Box>
			</Box>
		</Container>
	);
}
