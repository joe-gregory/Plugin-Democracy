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
		console.log("IM IN ");
		async function getCommunities() {
			let output = await request.request("get", "/community/about");
			console.log("Output in useEffect: ", output);
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
					? community.adminRecords.map((admin) => (
							<>
								<Typography>
									{admin.citizen
										? admin.citizen.fullName
										: ""}
								</Typography>
								<Typography>
									<b>Cargo: </b>
									{admin.title}
								</Typography>
								<Typography>
									<b>Fecha de inicio: </b>
									{admin.effectiveDate
										? admin.effectiveDate.split("T")[0]
										: admin.statusUpdateDate.split("T")[0]}
								</Typography>
								<Typography>
									<b>Fecha de expiración: </b>
									{admin.expirationDate.split("T")[0]}
								</Typography>
								<Typography>
									<b>Votos conectados: </b>
									{
										admin.votes.filter(
											(vote) => vote.vote === "plug"
										).length
									}
								</Typography>
							</>
					  ))
					: ""}
			</Box>
		</Container>
	);
}
