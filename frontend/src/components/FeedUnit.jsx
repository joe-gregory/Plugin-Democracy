import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgress } from "@mui/material";

import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import { CitizenContext } from "../contexts/citizen-context";
import Grid from "@mui/material/Grid";
import { RequestContext } from "../contexts/requests-context";
import { UpdateContext } from "../contexts/update-context";

const ExpandMore = styled((props) => {
	const { expand, ...other } = props;
	return <IconButton {...other} />;
})(({ theme, expand }) => ({
	transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
	marginLeft: "auto",
	transition: theme.transitions.create("transform", {
		duration: theme.transitions.duration.shortest,
	}),
}));

export default function FeedUnit({ record, community, update }) {
	const [expanded, setExpanded] = React.useState(false);
	const citizenContext = React.useContext(CitizenContext);
	const [vote, setVote] = React.useState(record.currentCitizensVote);

	const request = React.useContext(RequestContext);
	const [loading, setLoading] = React.useState(false);
	const updateContext = React.useContext(UpdateContext);

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};

	const handleVote = async () => {
		setLoading(true);
		let newVote;
		if (vote === "plug") newVote = "unplug";
		else if (vote === "unplug") newVote = "plug";
		console.log("NEW VOTE", newVote);
		let body = JSON.stringify({
			record: record,
			vote: { vote: newVote },
			community: { _id: community._id },
		});
		let output = await request.request(
			"post",
			"/community/vote",
			undefined,
			body
		);
		if (output.success === true) {
			setVote(newVote);
			updateContext.updateUpdate();
			record = output.record;
		}
		setLoading(false);
	};

	return (
		<Card
			sx={{
				maxWidth: 345,
				raised: true,
				elevation: 24,
				minWidth: 345,
			}}
		>
			<CardHeader
				avatar={
					<Typography
						sx={{
							bgcolor: "white",
							color: "primary.main",
							borderRadius: 2,
							padding: 1,
						}}
					>
						{record.identifier ? "type: " + record.type : "POST"}
					</Typography>
					/*<Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
						<PowerOutlinedIcon />
					</Avatar>*/
				}
				action={
					!record.identifier && record.author ? (
						<Avatar
							key={record.author + record.date}
							alt={record.author.firstName || "C"}
							src="https://localhost:8080/profile-picture"
						/>
					) : (
						<Typography>ID: {record.identifier}</Typography>
					)
				}
				title={
					record.identifier ? (
						<Typography>{record.title}</Typography>
					) : (
						""
					)
				}
				subheader={
					<Typography>
						{record.identifier
							? record.statusUpdateDate.split("T")[0]
							: record.date.split("T")[0]}{" "}
					</Typography>
				}
				sx={{ bgcolor: "primary.main", color: "white" }}
			/>
			{/*<CardMedia
				component="img"
				height="194"
				image={joinCommunityImage}
				alt="Paella dish"
			/>*/}
			<CardContent>
				{record.status ? (
					<Typography
						sx={{
							color:
								record.status === "active"
									? "primary.main"
									: record.status === "proposal"
									? "red"
									: "",
						}}
					>
						<b>status: </b>
						{record.status}
					</Typography>
				) : (
					""
				)}
				{record.effectiveDate ? (
					<Typography>
						<b>effective date: </b>
						{record.effectiveDate.split("T")[0]}
					</Typography>
				) : (
					""
				)}
				{record.expirationDate ? (
					<Typography>
						<b>expiration date: </b>
						{record.expirationDate.split("T")[0]}
					</Typography>
				) : (
					""
				)}

				<Typography variant="body2" sx={{ mt: 1 }}>
					{record.body}
				</Typography>
			</CardContent>
			{record.identifier ? (
				<CardActions
					disableSpacing
					sx={{ bgcolor: "primary.main", color: "white" }}
				>
					<IconButton aria-label="vote" onClick={handleVote}>
						<Avatar
							sx={{
								bgcolor: "white",
							}}
						>
							{loading ? (
								<CircularProgress />
							) : (
								<PowerOutlinedIcon
									sx={{
										color:
											vote === "plug"
												? "primary.main"
												: "red",
									}}
								/>
							)}
						</Avatar>
					</IconButton>
					<IconButton aria-label="share">
						<ShareIcon sx={{ color: "white" }} />
					</IconButton>
					<Grid
						container
						direction="column"
						justifyContent="start"
						alignItems="start"
						sx={{ ml: 3, mr: 1 }}
					>
						<Typography>
							plugged:{" "}
							{
								record.votes.filter(
									(vote) => vote.vote === "plug"
								).length
							}
						</Typography>
						<Typography>
							unplugged:{" "}
							{
								record.votes.filter(
									(vote) => vote.vote === "unplug"
								).length
							}
						</Typography>
					</Grid>

					{record.description ? (
						<ExpandMore
							expand={expanded}
							onClick={handleExpandClick}
							aria-expanded={expanded}
							aria-label="show more"
						>
							<ExpandMoreIcon />
						</ExpandMore>
					) : (
						""
					)}
				</CardActions>
			) : (
				""
			)}
			{record.description ? (
				<Collapse in={expanded} timeout="auto" unmountOnExit>
					<CardContent>
						<Typography paragraph>{record.description}</Typography>
					</CardContent>
				</Collapse>
			) : (
				""
			)}
		</Card>
	);
}
