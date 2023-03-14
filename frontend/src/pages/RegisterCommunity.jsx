import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import { RequestContext } from "../contexts/requests-context";
import Copyright from "../components/Copyright";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

export default function RegisterCommunity() {
	const [votingUnit, setVotingUnit] = React.useState(null);
	const [country, setCountry] = React.useState(null);
	const [language, setLanguage] = React.useState(null);
	const [disabled, setDisabled] = React.useState(false);
	const [loading, setLoading] = React.useState(false);

	const request = React.useContext(RequestContext);

	const handleSubmit = async (event) => {
		setLoading(true);
		event.preventDefault();

		const data = new FormData(event.currentTarget);
		let body = JSON.stringify({
			name: data.get("name"),
			address: data.get("address"),
			country: data.get("country"),
			votingUnit: votingUnit,
			homesStartingNumber: data.get("homesStartingNumber"),
			homesEndingNumber: data.get("homesEndingNumber"),
			language: language,
		});
		request.request("post", "/community/register", undefined, body);
		setLoading(false);
		setDisabled(true);
	};

	function handleVotingUnitChange(event) {
		setVotingUnit(event.target.value);
	}

	function handleCountryChange(event) {
		setCountry(event.target.value);
	}

	function handleLanguageChange(event) {
		setLanguage(event.target.value);
	}

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
					Register your community
				</Typography>
				<Box
					component="form"
					noValidate
					onSubmit={handleSubmit}
					sx={{ mt: 3 }}
				>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<TextField
								autoComplete="name"
								name="name"
								required
								fullWidth
								id="name"
								label="Community's Name"
								autoFocus
								disabled={disabled}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								autoComplete="address"
								name="address"
								required
								fullWidth
								id="address"
								label="Community's Address"
								autoFocus
								disabled={disabled}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel id="Labelcountry">
									Country
								</InputLabel>
								<Select
									id="country"
									value={country}
									label="Which country is this community in?"
									onChange={handleCountryChange}
									disabled={disabled}
								>
									<MenuItem value="US">USA</MenuItem>
									<MenuItem value="MX">Mexico</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel id="votingUnit">
									Who has voting power in this community?
								</InputLabel>
								<Select
									id="votingUnit"
									value={votingUnit}
									label="Who has voting power in this community?"
									onChange={handleVotingUnitChange}
									disabled={disabled}
								>
									<MenuItem value="homes.owner">
										Home owners
									</MenuItem>
									<MenuItem value="community.citizens">
										Community's residents
									</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								required
								fullWidth
								type="Number"
								id="homesStartingNumber"
								label="Community's homes starting number"
								name="homesStartingNumber"
								autoComplete="Community homes starting number"
								disabled={disabled}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								type="number"
								id="homesEndingNumber"
								label="Community's homes ending number"
								name="homesEndingNumber"
								autoComplete="Community's homes ending number"
								disabled={disabled}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel id="votingUnit">
									Community's language?
								</InputLabel>
								<Select
									id="votingUnit"
									value={language}
									label="Community's language?"
									onChange={handleLanguageChange}
									disabled={disabled}
								>
									<MenuItem value="EN">English</MenuItem>
									<MenuItem value="ES">Español</MenuItem>
								</Select>
							</FormControl>
						</Grid>
					</Grid>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
						disabled={disabled}
					>
						Register
					</Button>
				</Box>
			</Box>
			<Copyright sx={{ mt: 5 }} />
		</Container>
	);
}
