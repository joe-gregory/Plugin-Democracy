import { Container, Typography } from "@mui/material";

import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import { Box } from "@mui/system";
import Avatar from "@mui/material/Avatar";
import digitalDemocracy from "../assets/digitalDemocracy.png";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Home() {
	return (
		<Container>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					borderTop: "3px solid",
					borderBottom: "3px solid",
					color: "primary.main",
					textAlign: "center",
				}}
			>
				<Typography variant="h2" sx={{ color: "primary.main" }}>
					Plugin Democracy
				</Typography>
				<Avatar
					sx={{
						backgroundColor: "white",
						border: "4px solid",
						color: "primary.main",
						width: 50,
						height: 50,
						mb: 1,
					}}
				>
					<PowerOutlinedIcon
						sx={{ color: "primary.main", fontSize: 40 }}
					/>
				</Avatar>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<img src={digitalDemocracy} style={{ width: "100vw" }} />
			</Box>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1a-content"
				>
					<Box
						sx={{
							marginTop: 2,
							display: "flex",
							flexDirection: "column",
							alignItems: "start",
						}}
					>
						<Typography
							variant="h4"
							sx={{ textDecoration: "", color: "primary.main" }}
						>
							Who are we?
						</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails>
					<Box
						sx={{
							marginTop: 2,
							display: "flex",
							flexDirection: "column",
							alignItems: "start",
						}}
					>
						<Typography>
							We are a non-profit that provides communities with
							the technological and legal tools necessary to
							operate as direct democracies.
						</Typography>
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
							Over the past few decades, the political system in
							the US has experienced a decline in democracy. The
							rise of money in politics and the influence of
							special interest groups have made it increasingly
							difficult for average citizens to have their voices
							heard in the political process. This has led to a
							system where politicians are often more responsive
							to the needs of corporations and the wealthy than to
							the needs of their constituents.
						</Typography>
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
							Additionally, gerrymandering, voter suppression, and
							the influence of dark money have further eroded the
							democratic principles of our system. This has led to
							a feeling of disillusionment and frustration among
							many Americans, who feel that their voices are not
							being heard and that their government is no longer
							representative of their interests.
						</Typography>
					</Box>
					<Box
						sx={{
							marginTop: 2,
							display: "flex",
							flexDirection: "column",
							alignItems: "start",
						}}
					>
						In this context, the creation of Plugin Democracy offers
						a promising alternative. By providing a direct democracy
						platform to communities of all sizes, this non-profit
						organization allows citizens to participate directly in
						the political process and make their voices heard. This
						platform offers a space for people to propose and vote
						on legislation, giving them the power to shape their
						communities and their country.
					</Box>
					<Box
						sx={{
							marginTop: 2,
							display: "flex",
							flexDirection: "column",
							alignItems: "start",
						}}
					>
						This new model of democracy offers a more inclusive and
						participatory approach to governance, one that values
						the input and perspectives of all citizens. By using
						technology to facilitate communication and
						collaboration, Plugin Democracy offers a way to bypass
						the traditional power structures of our political system
						and empower communities to take control of their own
						futures. In this way, Plugin Democracy represents a
						much-needed step forward in the fight to reinvigorate
						democracy in the US.
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
							Learn more about the current state of our political
							system at{" "}
							<a href="https://represent.us/">represent.us</a>
						</Typography>
					</Box>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1a-content"
				>
					<Box
						sx={{
							marginTop: 2,
							display: "flex",
							flexDirection: "column",
							alignItems: "start",
						}}
					>
						<Typography
							variant="h4"
							sx={{ textDecoration: "", color: "primary.main" }}
						>
							How does Plugin Democracy work?
						</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails>
					<Box
						sx={{
							marginTop: 2,
							display: "flex",
							flexDirection: "column",
							alignItems: "start",
						}}
					>
						<Typography>
							Plugin Democracy is a style of{" "}
							<a href="https://en.wikipedia.org/wiki/Direct_democracy">
								direct democracy
							</a>{" "}
							that operates in real time, based on votes in favor
							with a lot of customization options to accomodate
							different communities needs. Anybody in a community
							can propose new rules, ammendments to existing
							rules, change in administration, changes in payroll
							to administration, proposal of community's projects
							and events and access to the community's accounting.
						</Typography>
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
							The platform allows for a "live" form of democracy.
							Citizens and residents do not need to wait for
							referendums or voting dates. At any time citizens
							can actively impact their community. The voting
							system is based on votes in favor. If a proposal is
							made, a citizen can "plug in" their vote. If enough
							votes are plugged in, the proposal passes and even
							support for existing laws can be removed by
							"unplugging" your vote. This all happens in real
							time.
						</Typography>
					</Box>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary>
					<Box
						sx={{
							marginTop: 2,
							display: "flex",
							flexDirection: "column",
							alignItems: "start",
						}}
					>
						<Typography
							variant="h4"
							sx={{ textDecoration: "", color: "primary.main" }}
						>
							How do I get started?
						</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails>
					<Box
						sx={{
							marginTop: 2,
							display: "flex",
							flexDirection: "column",
							alignItems: "start",
						}}
					>
						<Typography>
							If you are joining a community that is already
							enrolled in Plugin Democracy, simply create an
							account and head to join community in the top nav
							menu. Select your community from the dropdown menu
							and a request to join the community will be sent to
							the administrators. You will receive a confirmation
							email when your request gets confirmed. Make sure
							your information is up to date when you create an
							account.
						</Typography>
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
							If you are enrolling a new community, create an
							account and head to create community on the top nav
							bar. Fill out your community's information. We will
							get in touch with you regarding which steps need to
							be taken so your community can operate as a direct
							democracy.
						</Typography>
					</Box>
				</AccordionDetails>
			</Accordion>
		</Container>
	);
}
