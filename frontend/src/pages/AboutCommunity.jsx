import { useState, useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import Avatar from "@mui/material/Avatar";
import Container from "@mui/material/Container";
import Badge from "@mui/material/Badge";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";

import { Link } from "react-router-dom";

import { RequestContext } from "../context/requests-context";
import { CitizenContext } from "../context/citizen-context";

export default function AboutCommunity() {
	const [communities, setCommunities] = useState([]);
	const [community, setCommunity] = useState();

	const request = useContext(RequestContext);

	useEffect(() => {
		async function getCommunities() {
			let output = await request.request("get", "/community/about");
			for (let com of output.communities) {
				com.key = com._id;
			}
			setCommunities(output.communities);
			setCommunity(output.communities[0]);
		}
		getCommunities();
	}, []);

	function updateSelectedCommunity() {
		setCommunity(
			communities.find((community) => community._id === target.value)
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
				{community ? (
					communities.length > 1 ? (
						<Select onChange={updateSelectedCommunity}>
							{communities.map((community) => {
								<MenuItem
									key={community._id}
									value={community._id}
								>
									{community.name}
								</MenuItem>;
							})}
						</Select>
					) : (
						""
					)
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
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "start",
				}}
			>
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
				{community.permits.map((permitRecord) => (
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
								? permitRecord.effectiveDate.split("T")[0]
								: permitRecord.statusUpdateDate.split("T")[0]}
						</Typography>
						<Typography>
							<b>Fecha de expiracion: </b>
							{permitRecord.expirationDate.split("T")[0]}
						</Typography>
					</Box>
				))}
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
				{community.permits.map((project) => (
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
								: project.statusUpdateDate.split("T")[0]}
						</Typography>
						<Typography>
							<b>Fecha de fin: </b>
							{project.expirationDate
								? project.expirationDate.split("T")[0]
								: "Indefinido"}
						</Typography>
					</Box>
				))}
			</Box>
		</Container>
	);
}
