import { useState, useContext, useEffect } from "react";

import { CommunitiesContext } from "../context/communities-context";
import { RequestContext } from "../context/requests-context";

import Typography from "@mui/material/Typography";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

import FeedUnit from "../components/FeedUnit";

const CommunityFeed = () => {
	const [loading, setLoading] = useState(false);
	const communitiesContext = useContext(CommunitiesContext);
	const [currentCommunity, setCurrentCommunity] = useState(
		communitiesContext.communities[0]
	);
	const [disabled, setDisabled] = useState(false);
	const [feed, setFeed] = useState([]);
	const request = useContext(RequestContext);

	function handleSelectCommunity(event) {
		setCurrentCommunity(
			communitiesContext.communities.find(
				(community) => community._id === event.target.value
			)
		);
	}

	useEffect(() => {
		async function getFeed() {
			let url = "/community/" + currentCommunity._id;
			let output = await request.request("get", url);

			if (output.feed) setFeed(output.feed);
		}

		getFeed();
	}, [currentCommunity, feed]);

	return (
		<Container component="main" maxWidth="xs">
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
					variant="h4"
					sx={{ textAlign: "center" }}
				>
					Community Feed
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
				<Typography variant="h5">{currentCommunity.name}</Typography>
				<Typography>{currentCommunity.address}</Typography>
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
						Select community
					</InputLabel>
					<Select
						id="communityOptions"
						value={currentCommunity._id}
						onChange={handleSelectCommunity}
						label="Select your community from the list"
						disabled={disabled}
					>
						{communitiesContext.communities.map((community) => (
							<MenuItem value={community._id} key={community._id}>
								{community.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>

			{feed.map((r) => (
				<Box
					sx={{
						marginTop: 4,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<FeedUnit
						record={r}
						key={r.identifier}
						community={currentCommunity}
					/>
				</Box>
			))}
		</Container>
	);
};

export default CommunityFeed;
