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
import AdminImage from "../assets/admin.png";
import { RequestContext } from "../context/requests-context";

export default function Admin() {
	const [unverifiedCommunities, setUnverifiedCommunities] = useState();
	const [unverifiedCommunity, setUnverifiedCommunity] = useState();

	const [communitiesWithRequests, setCommunitiesWithRequests] = useState();
	const [communityWithRequest, setCommunityWithRequest] = useState();
	const [joinRequest, setJoinRequest] = useState();

	const [loading, setLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);

	const request = useContext(RequestContext);

	useEffect(() => {
		async function getAdminTasks() {
			let output = await request.request("get", "/admin");
			setUnverifiedCommunities(output.unverifiedCommunities);
			setCommunitiesWithRequests(output.verifiedCommunitiesWithRequests);
			setLoading(false);
		}
		getAdminTasks();
	}, []);

	function handleUnverifiedCommunityChange(event) {
		let unveri = unverifiedCommunities.find(
			(com) => com._id === event.target.value
		);
		setUnverifiedCommunity(unveri);
	}

	const handleUnverifiedCommunity = async (event) => {
		setLoading(true);
		event.preventDefault();

		let result = confirm(
			`Are you sure you are going to grant request to ${unverifiedCommunity.name}?\n\nHas the address been confirmed with Google?\n\nHas the legal team ensured the community can operate as described?`
		);
		let output;
		if (result === true) {
			let body = JSON.stringify({
				community: unverifiedCommunity._id,
				type: "unverifiedCommunity",
			});

			output = await request.request("post", "/admin", undefined, body);
		}
		if ((output.success = true)) {
			setDisabled(true);
		}
		setLoading(false);
	};

	async function handleCommunityWithRequest(event) {
		setCommunityWithRequest(
			communitiesWithRequests.find(
				(community) => community._id === event.target.value
			)
		);
	}
	async function handleJoinRequest(event) {
		setJoinRequest(
			communityWithRequest.joinRequests.find(
				(request) => request.citizen._id === event.target.value
			)
		);
	}

	async function handleSubmitJoinRequest() {
		setLoading(true);
		event.preventDefault();

		let result = confirm(
			`Are you sure you are going to grant request to ${joinRequest.citizen.fullName}?\n\nHas the citizen been confirmed with the community's administrators?\n\nHas the ownership status been confirmed by legal?`
		);
		console.log("RESULT", result);
		let output;
		if (result === true) {
			let body = JSON.stringify({
				community: communityWithRequest,
				joinRequest: joinRequest,
				type: "joinRequest",
			});

			output = await request.request("post", "/admin", undefined, body);
		} else {
			setLoading(false);
		}
		if (output.success === true) {
			setDisabled(true);
		}
		setLoading(false);
	}

	return (
		<Container component="main" maxWidth="xs">
			<Box
				component="form"
				noValidate
				onSubmit={handleUnverifiedCommunity}
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
					<Typography
						component="h1"
						variant="h3"
						sx={{ textAlign: "center" }}
					>
						Admin Console
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
					<Typography variant="h5">
						Unverified Community Requests:
					</Typography>
				</Box>
				<Box
					sx={{
						marginTop: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					{unverifiedCommunities ? (
						<FormControl fullWidth>
							<InputLabel id="LabelCommunityOptions">
								List of unverified communities
							</InputLabel>
							<Select
								id="unverifiedCommunities"
								value={unverifiedCommunity}
								onChange={handleUnverifiedCommunityChange}
								label="unverifiedCommunities"
								disabled={disabled}
							>
								{unverifiedCommunities.map((community) => (
									<MenuItem
										value={community._id}
										key={community._id}
									>
										{community.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					) : (
						""
					)}
				</Box>
				{unverifiedCommunity ? (
					<Box
						sx={{
							marginTop: 1,
							display: "flex",
							flexDirection: "column",
							alignItems: "start",
						}}
					>
						<Typography variant="h5">
							Request's details:{" "}
						</Typography>
						<Typography>
							<b>Name: </b>
							{unverifiedCommunity.name}
						</Typography>
						<Typography>
							<b>Address: </b>
							{unverifiedCommunity.address}
						</Typography>
						<Typography>
							<b>Amount of homes: </b>
							{unverifiedCommunity.homes.length}
						</Typography>
						<Typography>
							<b>Voting unit: </b>
							{unverifiedCommunity.votingUnit === "homes.owner"
								? "Home owners"
								: "Community Residents"}
						</Typography>
						<Typography>
							<b>Who to get in contact with? </b>
						</Typography>
						<Typography>
							{unverifiedCommunity.communityRegistrator.fullName}
						</Typography>
						<Typography>
							{unverifiedCommunity.communityRegistrator.email}
						</Typography>
						<Typography>
							{unverifiedCommunity.communityRegistrator.cellPhone}
						</Typography>
						<Button
							type="submit"
							variant="contained"
							sx={{ mb: 2 }}
							disabled={disabled}
						>
							Approve Request
						</Button>
					</Box>
				) : (
					""
				)}
			</Box>
			<Box
				component="form"
				noValidate
				onSubmit={handleSubmitJoinRequest}
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
					<Typography variant="h5">
						Join Community Requests:
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
					{communitiesWithRequests ? (
						<FormControl fullWidth>
							<InputLabel id="labelCommunityWithRequests">
								Join Community Requests
							</InputLabel>
							<Select
								id="communitiesWithRequests"
								value={communityWithRequest}
								onChange={handleCommunityWithRequest}
								label="Communities With Requests"
								disabled={disabled}
							>
								{communitiesWithRequests.map((community) => (
									<MenuItem
										value={community._id}
										key={community._id}
									>
										Community: {community.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					) : (
						""
					)}{" "}
				</Box>
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					{communityWithRequest ? (
						<FormControl fullWidth>
							<InputLabel id="labelJoinCommunity">
								Join Requests
							</InputLabel>
							<Select
								id="joinRequests"
								value={joinRequest}
								onChange={handleJoinRequest}
								label="Join Requests"
								disabled={disabled}
							>
								{communityWithRequest.joinRequests.map(
									(request) => (
										<MenuItem
											value={request.citizen._id}
											key={request.citizen._id}
										>
											{request.citizen.fullName}
										</MenuItem>
									)
								)}
							</Select>
						</FormControl>
					) : (
						""
					)}
				</Box>
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					{joinRequest ? (
						<Box
							sx={{
								marginTop: 1,
								display: "flex",
								flexDirection: "column",
								alignItems: "start",
							}}
						>
							<Typography>
								<b>Name: </b>
								{joinRequest.citizen.fullName}
							</Typography>
							<Typography>
								<b>Contact email: </b>
								{joinRequest.citizen.email}
							</Typography>
							<Typography>
								<b>Contact number: </b>
								{joinRequest.citizen.cellPhone}
							</Typography>
							<Typography>
								<b>Home number: </b>
								{joinRequest.homeNumber}
							</Typography>
							<Typography>
								<b>Owner or resident? </b>
								{joinRequest.type}
							</Typography>

							<Button
								type="submit"
								variant="contained"
								disabled={disabled}
								sx={{ mt: 1 }}
							>
								Join into Community
							</Button>
						</Box>
					) : (
						""
					)}
				</Box>
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<img src={AdminImage} style={{ width: "100vw" }}></img>
				</Box>
			</Box>
		</Container>
	);
}
