import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import CreateProposalImage from "../assets/createProposal.png";
import { RequestContext } from "../contexts/requests-context";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import Copyright from "../components/Copyright";
import { CommunitiesContext } from "../contexts/communities-context";

export default function CreateProposal() {
	const [loading, setLoading] = React.useState(false);
	const [disabled, setDisabled] = React.useState(false);
	const communitiesContext = React.useContext(CommunitiesContext);
	const [selectedCommunity, setSelectedCommunity] = React.useState(
		communitiesContext.communities[0]
	);
	const [type, setType] = React.useState();

	const request = React.useContext(RequestContext);

	const handleSelectedCommunity = async (event) => {
		setSelectedCommunity(
			communitiesContext.communities.find(
				(community) => community._id === event.target.value
			)
		);
	};

	function handleTypeChange(event) {
		setType(event.target.value);
	}

	const handleSubmit = async (event) => {
		setLoading(true);
		event.preventDefault();

		const data = new FormData(event.currentTarget);
		let body = JSON.stringify({
			type: type,
			title: data.get("title"),
			body: data.get("body"),
			description: data.get("description"),
			effectiveDate: data.get("effectiveDate"),
			expirationDate: data.get("expirationDate"),
			salary: data.get("salary"),
			frequencyPay: data.get("frequency"),
			community: selectedCommunity,
		});
		let output = await request.request(
			"post",
			"createproposal",
			undefined,
			body
		);
		if (output.success) setDisabled(true);
		setLoading(false);
	};

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
				<Typography component="h1" variant="h5">
					Create a New Proposal
				</Typography>
			</Box>

			<Box
				component="form"
				onSubmit={handleSubmit}
				noValidate
				sx={{ mt: 1 }}
			>
				{communitiesContext.communities.length > 0 ? (
					<Box
						sx={{
							marginTop: 2,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<FormControl fullWidth>
							<InputLabel id="selectCommunity">
								Community for which to write proposal
							</InputLabel>
							<Select
								id="selectedCommunitySelect"
								value={selectedCommunity._id}
								onChange={handleSelectedCommunity}
								label="For which of your communities is this proposal?"
								disabled={disabled}
							>
								{communitiesContext.communities.map(
									(community) => (
										<MenuItem
											value={community._id}
											key={community._id}
										>
											{community.name}
										</MenuItem>
									)
								)}
							</Select>
						</FormControl>
					</Box>
				) : (
					""
				)}
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<FormControl fullWidth>
						<InputLabel id="selectCommunity">
							Type of Proposal
						</InputLabel>
						<Select
							id="type"
							value={type}
							onChange={handleTypeChange}
							label="What type of proposal is this?"
							disabled={disabled}
						>
							<MenuItem value="law" key="law">
								New Law
							</MenuItem>
							<MenuItem value="role" key="role">
								New Hire
							</MenuItem>
							<MenuItem value="project" key="project">
								A New Community Project
							</MenuItem>
							<MenuItem value="permit" key="permit">
								New Permit
							</MenuItem>
							<MenuItem value="badge" key="badge">
								Suggest a Badge, Trophy or Award for a Citizen
							</MenuItem>
						</Select>
					</FormControl>
				</Box>
				{type === "law" ? <LawInputs disabled={disabled} /> : ""}
				{type === "role" ? <NewHire disabled={disabled} /> : ""}

				<Button
					type="submit"
					fullWidth
					variant="contained"
					sx={{ mt: 3, mb: 2 }}
				>
					Propose
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
				<img src={CreateProposalImage} style={{ width: "100vw" }}></img>
			</Box>
			<Copyright sx={{ mt: 1, mb: 4 }} />
		</Container>
	);
}

function LawInputs({ disabled }) {
	return (
		<>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<TextField
					margin="normal"
					required
					fullWidth
					id="title"
					label="Title"
					name="title"
					autoComplete="title"
					autoFocus
					disabled={disabled}
				/>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<TextField
					margin="normal"
					required
					fullWidth
					id="body"
					label="Body"
					name="body"
					autoComplete="body"
					multiline="true"
					autoFocus
					disabled={disabled}
					minRows="15"
				/>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<TextField
					margin="normal"
					required
					fullWidth
					id="description"
					label="Description"
					name="description"
					autoComplete="description"
					autoFocus
					disabled={disabled}
					multiline="true"
					minRows="15"
				/>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				<TextField
					required
					id="effectiveDate"
					name="effectiveDate"
					label="When would this law take effect?"
					type="date"
					defaultValue=""
					disabled={disabled}
					sx={{ width: 220 }}
					InputLabelProps={{
						shrink: true,
					}}
				/>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				<TextField
					required
					id="expirationDate"
					name="expirationDate"
					label="When would this law expire?"
					type="date"
					defaultValue=""
					disabled={disabled}
					sx={{ width: 220 }}
					InputLabelProps={{
						shrink: true,
					}}
				/>
			</Box>
		</>
	);
}

function NewHire({ disabled }) {
	const [frequency, setFrequency] = React.useState("hourly");
	return (
		<>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<TextField
					margin="normal"
					required
					fullWidth
					id="title"
					label="Title"
					name="title"
					autoComplete="title"
					autoFocus
					disabled={disabled}
				/>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<TextField
					margin="normal"
					required
					fullWidth
					id="body"
					label="Responsabilities"
					name="body"
					autoComplete="responsabilities"
					multiline="true"
					autoFocus
					disabled={disabled}
					minRows="10"
				/>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<TextField
					margin="normal"
					required
					fullWidth
					id="description"
					label="Description"
					name="description"
					autoComplete="description"
					autoFocus
					disabled={disabled}
					multiline="true"
					minRows="10"
				/>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				<TextField
					required
					id="salary"
					name="salary"
					label="How much will be this role be payed?"
					type="number"
					defaultValue=""
					sx={{ width: 220 }}
					InputLabelProps={{
						shrink: true,
					}}
					disabled={disabled}
				/>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				<FormControl fullWidth>
					<InputLabel id="selectCommunity">Pay frequency</InputLabel>
					<Select
						id="type"
						value={frequency}
						onChange={(event) => {
							setFrequency(event.target.value);
						}}
						label="What is the proposed pay frequency?"
						disabled={disabled}
					>
						<MenuItem value="hourly" key="hourly">
							hourly
						</MenuItem>
						<MenuItem value="weekly" key="weekly">
							weekly
						</MenuItem>
						<MenuItem value="bi-weekly" key="bi-weekly">
							bi-weekly
						</MenuItem>
						<MenuItem value="monthly" key="monthly">
							monthly
						</MenuItem>
					</Select>
				</FormControl>
			</Box>

			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				<TextField
					required
					id="effectiveDate"
					name="effectiveDate"
					label="When would this role take effect?"
					type="date"
					defaultValue=""
					sx={{ width: 220 }}
					InputLabelProps={{
						shrink: true,
					}}
					disabled={disabled}
				/>
			</Box>

			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				<TextField
					required
					id="expirationDate"
					name="expirationDate"
					label="When would this role expire?"
					type="date"
					defaultValue=""
					sx={{ width: 220 }}
					InputLabelProps={{
						shrink: true,
					}}
					disabled={disabled}
				/>
			</Box>
		</>
	);
}
