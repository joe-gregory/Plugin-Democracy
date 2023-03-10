import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";

import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";

import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";

import { AuthContext } from "../context/auth-context";
import { MessagesContext } from "../context/messages-context";
import { RequestContext } from "../context/requests-context";
import { CitizenContext } from "../context/citizen-context";
import { CommunitiesContext } from "../context/communities-context";

const signedOutPages = [
	{
		text: "Login",
		link: "/login",
	},
	{
		text: "Sign Up",
		link: "/signup",
	},
	/*
	{
		text: "Test Messages",
		link: "/test-messages",
	},*/
];
/*
const signedInPages = [
	{
		text: "My Community",
		link: "/community",
	},
	{
		text: "Create Proposal",
		link: "/createproposal",
	},

	{
		text: "About Community",
		link: "/community/about",
	},
	/*
	{
		text: "Test Messages",
		link: "/test-messages",
	},
];*/

export default function NavBar() {
	const auth = React.useContext(AuthContext);
	const [anchorElNav, setAnchorElNav] = React.useState(null);
	const messages = React.useContext(MessagesContext);

	const communitiesContext = React.useContext(CommunitiesContext);
	const citizenContext = React.useContext(CitizenContext);

	const [signedInPages, setSignedInPages] = React.useState([
		{
			text: "My Community",
			link: "/community",
		},
		{
			text: "Create Proposal",
			link: "/createproposal",
		},

		{
			text: "About Community",
			link: "/community/about",
		},
	]);

	React.useEffect(() => {
		let signedIn = [];

		if (communitiesContext.communities.length === 0) {
			signedIn.push(
				{
					text: "Register Community",
					link: "/community/register",
				},
				{
					text: "Join Existing Community",
					link: "/community/join",
				}
			);
		} else {
			signedIn.push(
				{
					text: "My Community",
					link: "/community",
				},
				{
					text: "Create Proposal",
					link: "/createproposal",
				},

				{
					text: "About Community",
					link: "/community/about",
				}
			);
		}
		if (
			citizenContext.citizen &&
			citizenContext.citizen.superAdmin === true
		) {
			signedIn.push({ text: "Admin Console", link: "/admin" });
		}
		setSignedInPages(signedIn);
	}, [communitiesContext.communities, citizenContext.citizen]);

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	return (
		<>
			<AppBar position="static">
				<Container maxWidth="xl">
					<Toolbar disableGutters>
						{/*Icon and Title when navbar is expanded */}
						<PowerOutlinedIcon
							sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
						/>
						<Typography
							variant="h6"
							noWrap
							component={Link}
							to="/"
							sx={{
								mr: 2,
								display: { xs: "none", md: "flex" },
								fontFamily: "monospace",
								fontWeight: 700,
								letterSpacing: ".3rem",
								color: "inherit",
								textDecoration: "none",
								textAlign: "center",
							}}
						>
							PLUGIN DEMOCRACY
						</Typography>
						{/*End icon and title when navbar is expanded*/}
						{/*Hamburger menu box begin*/}
						<Box
							sx={{
								flexGrow: 1,
								display: { xs: "flex", md: "none" },
							}}
						>
							<IconButton
								size="large"
								aria-label="account of current user"
								aria-controls="menu-appbar"
								aria-haspopup="true"
								onClick={handleOpenNavMenu}
								color="inherit"
							>
								<MenuIcon />
							</IconButton>
							{/*Hamburger Menu*/}
							<Menu
								id="menu-appbar"
								anchorEl={anchorElNav}
								anchorOrigin={{
									vertical: "bottom",
									horizontal: "left",
								}}
								keepMounted
								transformOrigin={{
									vertical: "top",
									horizontal: "left",
								}}
								open={Boolean(anchorElNav)}
								onClose={handleCloseNavMenu}
								sx={{
									display: { xs: "block", md: "none" },
								}}
							>
								{/*Hamburger Menu Pages*/}
								{auth.authenticated
									? signedInPages.map((page) => (
											<MenuItem
												key={page.text}
												component={Link}
												to={page.link}
												onClick={handleCloseNavMenu}
											>
												<Typography textAlign="center">
													{page.text}
												</Typography>
											</MenuItem>
									  ))
									: signedOutPages.map((page) => (
											<MenuItem
												key={page.text}
												component={Link}
												to={page.link}
												onClick={handleCloseNavMenu}
											>
												<Typography textAlign="center">
													{page.text}
												</Typography>
											</MenuItem>
									  ))}
							</Menu>{" "}
							{/*Ends hamburger Menu */}
						</Box>{" "}
						{/*Ends hamburger menu Box*/}
						{/*Icon and title when NavBar is compressed start*/}
						<PowerOutlinedIcon
							sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
						/>
						<Typography
							variant="h5"
							component={Link}
							to="/"
							sx={{
								//mr: 2,
								display: { xs: "flex", md: "none" },
								flexGrow: 1,
								fontFamily: "monospace",
								fontWeight: 700,
								letterSpacing: ".3rem",
								color: "inherit",
								textDecoration: "none",
							}}
						>
							PLUGIN DEMOCRACY
						</Typography>
						{/*Icon and title when NavBar is compressed end*/}
						{/*Box for when navbar is NOT compressed */}
						<Box
							sx={{
								flexGrow: 1,
								display: { xs: "none", md: "flex" },
							}}
						>
							{/*Pages that show on top bar NOT in hamburger*/}
							{auth.authenticated
								? signedInPages.map((page) => (
										<Button
											key={page.text}
											component={Link}
											to={page.link}
											sx={{
												my: 2,
												color: "white",
												display: "block",
											}}
										>
											{page.text}
										</Button>
								  ))
								: signedOutPages.map((page) => (
										<Button
											key={page.text}
											component={Link}
											to={page.link}
											sx={{
												my: 2,
												color: "white",
												display: "block",
											}}
										>
											{page.text}
										</Button>
								  ))}
						</Box>{" "}
						{/*End box for when Navbar is NOT compressed*/}
						{/* User Menu Box begin*/}
						{auth.authenticated ? <CitizenBubble /> : ""}
						{/*End user menu Box*/}
					</Toolbar>
				</Container>
			</AppBar>
			{messages.messages.map((message, index) => (
				<Message
					key={message.key}
					severity={message.severity}
					message={message.message}
				/>
			))}
		</>
	);
}

function CitizenBubble() {
	const [anchorElUser, setAnchorElUser] = React.useState(null);
	const request = React.useContext(RequestContext);
	const navigate = useNavigate();
	const citizenContext = React.useContext(CitizenContext);
	let citizen = citizenContext.citizen;

	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	function account() {
		handleCloseUserMenu();
		navigate("/account");
	}
	function logout() {
		handleCloseUserMenu();
		request.request("post", "logout");
	}
	return (
		<Box sx={{ flexGrow: 0 }}>
			<Tooltip title="Open settings">
				<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
					<Avatar
						key={citizen ? citizen._id : "C"}
						alt={citizen ? citizen.firstName : "C"}
						src="https://localhost:8080/profile-picture"
					/>
				</IconButton>
			</Tooltip>
			<Menu
				sx={{ mt: "45px" }}
				id="menu-appbar"
				anchorEl={anchorElUser}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				keepMounted
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={Boolean(anchorElUser)}
				onClose={handleCloseUserMenu}
			>
				<MenuItem key={"Perfil"} onClick={account}>
					<Typography textAlign="center">Cuenta</Typography>
				</MenuItem>
				<MenuItem key="Cerrar sesion" onClick={logout}>
					<Typography textAlign="center">Cerrar sesión</Typography>
				</MenuItem>
			</Menu>
		</Box>
	);
}

function Message({ severity, message }) {
	const [open, setOpen] = React.useState(true);

	return (
		<Box sx={{ width: "100%" }}>
			<Collapse in={open}>
				<Alert
					severity={severity}
					action={
						<IconButton
							aria-label="close"
							color="inherit"
							size="small"
							onClick={() => {
								setOpen(false);
							}}
						>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					}
				>
					{message}
				</Alert>
			</Collapse>
		</Box>
	);
}
