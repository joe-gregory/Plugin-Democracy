import { useState, useContext, useEffect, createClass } from "react";

import GMap from "../components/GMap";
import React, { Component } from "react"; //del
import Avatar from "@mui/material/Avatar";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Tooltip from "@mui/material/Tooltip";

import { RequestContext } from "../contexts/requests-context";
import { CommunitiesContext } from "../contexts/communities-context";
import aboutCommunity1 from "../assets/aboutCommunity1.png";
import aboutCommunity2 from "../assets/aboutCommunity2.png";
import aboutCommunity3 from "../assets/aboutCommunity3.png";

export default function AboutCommunity() {
	const communitiesContext = useContext(CommunitiesContext);
	const [communities, setCommunities] = useState(
		communitiesContext.communities
	);
	const [community, setCommunity] = useState(communities[0]);
	const [key, setKey] = useState();
	const [disabled, setDisabled] = useState();

	const request = useContext(RequestContext);

	useEffect(() => {
		async function getCommunities() {
			let output = await request.request("get", "/community/about");
			setKey(output.key); //Change how this is passed
		}
		getCommunities();
	}, []);

	function updateSelectedCommunity(event) {
		setCommunity(
			communities.find(
				(community) => community._id === event.target.value
			)
		);
	}

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
				<Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
					<PowerOutlinedIcon />
				</Avatar>
				<Typography
					sx={{ textAlign: "center" }}
					component="h1"
					variant="h3"
				>
					About Community
				</Typography>

				{communitiesContext.communities.length > 0 ? (
					<FormControl fullWidth>
						<Select
							id="type"
							value={community._id}
							onChange={updateSelectedCommunity}
							disabled={disabled}
						>
							{communitiesContext.communities.map((community) => (
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
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography variant="h4">
					{community ? community.name : ""}
				</Typography>
				<Typography>{community ? community.address : ""}</Typography>
			</Box>
			{/*Google Map */}
			{/*<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<GMap apiKey={key} />
			</Box>*/}
			<IFrame />
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				<Typography variant="h4">General Data</Typography>
				<Typography>
					<b>Language: </b>
					{community ? community.language : ""}
				</Typography>
				<Typography>
					<b>Voting unit: </b>
					{community
						? community.votingUnit === "homes.owner"
							? "Home owners"
							: "Residents"
						: ""}
				</Typography>
				<Tooltip
					title="Remember, this feature is up to the community. Do you think it should be a different? Create a proposal!"
					arrow
				>
					<Typography>
						<b>Proposal's time limit: </b>
						{community ? community.proposalLimit : ""} dias
					</Typography>
				</Tooltip>

				<Typography>
					<b>Amount of homes: </b>
					{community ? community.homes.length : ""}
				</Typography>
				<Typography>
					<b>Amount of citizens: </b>
					{community ? community.citizens.length : ""}
				</Typography>
				<Typography>
					<b>Amount of home owners: </b>
					{community ? community.owners.length : ""}
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
				<img src={aboutCommunity1} style={{ width: "100vw" }} />
			</Box>
			{community && community.adminRecords.length > 0 ? (
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Typography variant="h4">Management</Typography>
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
				{community && community.adminRecords.length > 0
					? community.adminRecords.map((adminRecord) => (
							<Container key={adminRecord.identifier}>
								<Typography>
									{adminRecord.citizen
										? adminRecord.citizen.fullName
										: ""}
								</Typography>
								<Typography>
									<b>Cargo: </b>
									{adminRecord.title}
								</Typography>
								<Typography>{adminRecord.body}</Typography>
								<Typography>
									<b>Start date: </b>
									{adminRecord.effectiveDate
										? adminRecord.effectiveDate.split(
												"T"
										  )[0]
										: adminRecord.statusUpdateDate.split(
												"T"
										  )[0]}
								</Typography>
								<Typography>
									<b>Term limit: </b>
									{adminRecord.expirationDate.split("T")[0]}
								</Typography>
								<Typography>
									<b>Plugged in votes: </b>
									{
										adminRecord.votes.filter(
											(vote) => vote.vote === "plug"
										).length
									}
								</Typography>
							</Container>
					  ))
					: ""}
			</Box>
			{community && community.adminRecords.length > 0 ? (
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<img src={aboutCommunity2} style={{ width: "100vw" }} />
				</Box>
			) : (
				""
			)}

			{community && community.nonAdminRoleRecords.length > 0 ? (
				<Typography variant="h4">Employees</Typography>
			) : (
				""
			)}
			<Box
				sx={{
					marginTop: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				{community
					? community.nonAdminRoleRecords.map(
							(nonAdminRoleRecord) => (
								<Container key={nonAdminRoleRecord.identifier}>
									<Typography sx={{ color: "red" }}>
										Need to hire, <a href="#">input info</a>
										, or select from <a href="#">members</a>
										.
									</Typography>
									<Typography>
										<b>Cargo: </b>
										{nonAdminRoleRecord.title}
									</Typography>
									<Typography>
										{nonAdminRoleRecord.body}
									</Typography>
									<Typography>
										<b>Start Date: </b>
										{nonAdminRoleRecord.effectiveDate
											? nonAdminRoleRecord.effectiveDate.split(
													"T"
											  )[0]
											: nonAdminRoleRecord.statusUpdateDate.split(
													"T"
											  )[0]}
									</Typography>
									<Typography>
										<b>End Date: </b>
										{nonAdminRoleRecord.expirationDate
											? nonAdminRoleRecord.expirationDate.split(
													"T"
											  )[0]
											: "None"}
									</Typography>
									<Typography>
										<b>Plugged in votes: </b>
										{
											nonAdminRoleRecord.votes.filter(
												(vote) => vote.vote === "plug"
											).length
										}
									</Typography>
								</Container>
							)
					  )
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
				<Typography variant="h4">Constitution</Typography>
			</Box>

			{community
				? Object.keys(community.constitution)
						.sort((a, b) => {
							if (a === "") {
								return -1; // empty key should come first
							} else if (b === "") {
								return 1; // empty key should come first
							} else {
								return 0; // keep original order of other keys
							}
						})
						.map((category) => (
							<Container>
								<Typography>
									<b>{category}</b>
								</Typography>
								{community.constitution[category].map(
									(record) => (
										<Box
											sx={{
												marginTop: 2,
												display: "flex",
												flexDirection: "column",
												alignItems: "start",
											}}
										>
											<Typography>
												{category !== ""
													? record.lawCategoryNumber
													: record.number}
												{". "}
												{record.title}
											</Typography>
											<Typography>
												{record.body}
											</Typography>
										</Box>
									)
								)}
							</Container>
						))
				: ""}
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<img src={aboutCommunity3} style={{ width: "100vw" }} />
			</Box>
			{community && community.permits.length > 0 ? (
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Typography variant="h4">Permisos</Typography>
				</Box>
			) : (
				""
			)}
			{community && community.permits.length > 0 ? (
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "start",
					}}
				>
					{community
						? community.permits.map((permitRecord) => (
								<Box
									sx={{
										marginTop: 2,
										display: "flex",
										flexDirection: "column",
										alignItems: "start",
									}}
								>
									<Typography>
										{permitRecord.title}
									</Typography>
									<Typography>{permitRecord.body}</Typography>
									<Typography>
										<b>Fecha de inicio: </b>
										{permitRecord.effectiveDate
											? permitRecord.effectiveDate.split(
													"T"
											  )[0]
											: permitRecord.statusUpdateDate.split(
													"T"
											  )[0]}
									</Typography>
									<Typography>
										<b>Fecha de expiracion: </b>
										{
											permitRecord.expirationDate.split(
												"T"
											)[0]
										}
									</Typography>
								</Box>
						  ))
						: ""}
				</Box>
			) : (
				""
			)}
			{community && community.projects.length > 0 ? (
				<Box
					sx={{
						marginTop: 2,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Typography variant="h4">Projects</Typography>
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
				{community
					? community.projects.map((project) => (
							<Box
								sx={{
									marginTop: 2,
									display: "flex",
									flexDirection: "column",
									alignItems: "start",
								}}
							>
								<Typography>{project.title}</Typography>
								<Typography>{project.body}</Typography>
								<Typography>
									<b>Fecha de inicio: </b>
									{project.effectiveDate
										? project.effectiveDate.split("T")[0]
										: project.statusUpdateDate.split(
												"T"
										  )[0]}
								</Typography>
								<Typography>
									<b>Expiration date: </b>
									{project.expirationDate
										? project.expirationDate.split("T")[0]
										: "Indefinite"}
								</Typography>
							</Box>
					  ))
					: ""}
			</Box>
		</Container>
	);
}

function IFrame() {
	return (
		<Box
			sx={{
				marginTop: 2,
				display: "flex",
				flexDirection: "column",
				alignItems: "start",
			}}
		>
			<iframe
				src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d26856.68265412758!2d-117.15344460314942!3d32.710360156713996!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d9536d042520d1%3A0x184d9db8c2e70dc8!2sSherman%20Heights%2C%20San%20Diego%2C%20California%2092102!5e0!3m2!1ses!2sus!4v1678469923384!5m2!1ses!2sus"
				width="100%vw"
				allowfullscreen=""
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
				style={{ border: 0 }}
			></iframe>
		</Box>
	);
}
