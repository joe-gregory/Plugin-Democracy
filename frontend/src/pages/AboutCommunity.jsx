import { useState, useContext, useEffect, createClass } from "react";

import GMap from "../components/GMap";
import React, { Component } from "react"; //del

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

import { RequestContext } from "../context/requests-context";
import { CommunitiesContext } from "../context/communities-context";

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
				<Typography
					sx={{ textAlign: "center" }}
					component="h1"
					variant="h3"
				>
					Sobre Comunidad
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

			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				<Typography variant="h4">Datos Generales</Typography>
				<Typography>
					<b>Lenguaje: </b>
					{community ? community.language : ""}
				</Typography>
				<Typography>
					<b>Unidad de voto: </b>
					{community
						? community.votingUnit === "homes.owner"
							? "Propietarios"
							: "Residentes"
						: ""}
				</Typography>
				<Typography>
					<b>Limite para propuestas: </b>
					{community ? community.proposalLimit : ""} dias
				</Typography>
				<Typography>
					<b>Numero de residencias: </b>
					{community ? community.homes.length : ""}
				</Typography>
				<Typography>
					<b>Numero de ciudadanos: </b>
					{community ? community.citizens.length : ""}
				</Typography>
				<Typography>
					<b>Numero de propietarios: </b>
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
				<Typography variant="h4">Administradores</Typography>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				{community
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
									<b>Fecha de inicio: </b>
									{adminRecord.effectiveDate
										? adminRecord.effectiveDate.split(
												"T"
										  )[0]
										: adminRecord.statusUpdateDate.split(
												"T"
										  )[0]}
								</Typography>
								<Typography>
									<b>Fecha de expiración: </b>
									{adminRecord.expirationDate.split("T")[0]}
								</Typography>
								<Typography>
									<b>Votos conectados: </b>
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
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography variant="h4">Roles</Typography>
			</Box>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
				{community
					? community.nonAdminRoleRecords.map(
							(nonAdminRoleRecord) => (
								<Container key={nonAdminRoleRecord.identifier}>
									<Typography>
										{nonAdminRoleRecord.citizen
											? nonAdminRoleRecord.citizen
													.fullName
											: ""}
									</Typography>
									<Typography>
										<b>Cargo: </b>
										{nonAdminRoleRecord.title}
									</Typography>
									<Typography>
										{nonAdminRoleRecord.body}
									</Typography>
									<Typography>
										<b>Fecha de inicio: </b>
										{nonAdminRoleRecord.effectiveDate
											? nonAdminRoleRecord.effectiveDate.split(
													"T"
											  )[0]
											: nonAdminRoleRecord.statusUpdateDate.split(
													"T"
											  )[0]}
									</Typography>
									<Typography>
										<b>Fecha de expiración: </b>
										{
											nonAdminRoleRecord.expirationDate.split(
												"T"
											)[0]
										}
									</Typography>
									<Typography>
										<b>Votos conectados: </b>
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
				<Typography variant="h4">Constitución</Typography>
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
				<Typography variant="h4">Permisos</Typography>
			</Box>
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
								<Typography>{permitRecord.title}</Typography>
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
									{permitRecord.expirationDate.split("T")[0]}
								</Typography>
							</Box>
					  ))
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
				<Typography variant="h4">Proyectos</Typography>
			</Box>
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
									<b>Fecha de fin: </b>
									{project.expirationDate
										? project.expirationDate.split("T")[0]
										: "Indefinido"}
								</Typography>
							</Box>
					  ))
					: ""}
			</Box>
		</Container>
	);
}
