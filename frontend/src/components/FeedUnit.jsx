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

import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import { CitizenContext } from "../context/citizen-context";
import Grid from "@mui/material/Grid";
import { RequestContext } from "../context/requests-context";

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

export default function FeedUnit({ record, community }) {
	const [expanded, setExpanded] = React.useState(false);
	const citizenContext = React.useContext(CitizenContext);
	const [vote, setVote] = React.useState(
		record.votes.length > 0
			? record.votes.find(
					(vote) => vote.citizen === citizenContext.citizen._id
			  ).vote
			: "unplug"
	);
	const request = React.useContext(RequestContext);

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};

	const handleVote = async () => {
		let newVote;
		if (vote === "plug") newVote = "unplug";
		if (vote === "unplug") newVote = "plug";
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
		if (output.success === true) setVote(newVote);
	};

	return (
		<Card
			sx={{
				maxWidth: 345,
				raised: true,
				elevation: 24,
			}}
		>
			<CardHeader
				avatar={
					<Typography>type: {record.type}</Typography>
					/*<Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
						<PowerOutlinedIcon />
					</Avatar>*/
				}
				/*action={
					<IconButton aria-label="settings">
						<MoreVertIcon />
					</IconButton>
				}*/
				title={<Typography>{record.title}</Typography>}
				subheader={
					<Typography>
						{record.statusUpdateDate.split("T")[0]}
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
				<Typography>
					<b>status: </b>
					{record.status}
				</Typography>
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
			<CardActions
				disableSpacing
				sx={{ bgcolor: "primary.main", color: "white" }}
			>
				<IconButton aria-label="vote" onClick={handleVote}>
					<Avatar
						sx={{
							gbcolor: vote === "plug" ? "primary.main" : "white",
						}}
					>
						<PowerOutlinedIcon
							sx={{
								color: vote === "plug" ? "primary.main" : "red",
							}}
						/>
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
							record.votes.filter((vote) => vote.vote === "plug")
								.length
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
