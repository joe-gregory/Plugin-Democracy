import * as React from "react";
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
import { Link } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { AlertContext } from "../context/alert-context";
import { request } from "../utilities";

const signedOutPages = [
	{
		text: "Acceder",
		href: "/login",
	},
	{
		text: "Inscribirse",
		href: "/signup",
	},
];

const signedInPages = [
	{
		text: "Mi Comunidad",
		href: "/community",
	},
	{
		text: "Crear Propuesta",
		href: "createproposal",
	},
];

export default function NavBar() {
	const auth = React.useContext(AuthContext);
	const alertMessages = React.useContext(AlertContext);

	const [anchorElNav, setAnchorElNav] = React.useState(null);

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	return (
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
						}}
					>
						DEMOCRACIA CONECTADA
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
							{auth.isLoggedIn
								? signedInPages.map((page) => (
										<MenuItem
											key={page.text}
											component={Link}
											to={page.href}
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
											to={page.href}
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
							mr: 2,
							display: { xs: "flex", md: "none" },
							flexGrow: 1,
							fontFamily: "monospace",
							fontWeight: 700,
							letterSpacing: ".3rem",
							color: "inherit",
							textDecoration: "none",
						}}
					>
						DEMOCRACIA CONECTADA
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
						{auth.isLoggedIn
							? signedInPages.map((page) => (
									<Button
										key={page.text}
										href={page.href}
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
										href={page.href}
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
					{auth.isLoggedIn ? <CitizenBubble /> : ""}
					{/*End user menu Box*/}
				</Toolbar>
			</Container>
		</AppBar>
	);
}

function CitizenBubble() {
	const [anchorElUser, setAnchorElUser] = React.useState(null);
	const auth = React.useContext(AuthContext);

	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	function logout() {
		handleCloseUserMenu();
		request("post", "logout");
		auth.logout();
	}
	return (
		<Box sx={{ flexGrow: 0 }}>
			<Tooltip title="Open settings">
				<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
					<Avatar alt="C" src="/static/images/avatar/2.jpg" />
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
				<MenuItem key={"Perfil"} onClick={handleCloseUserMenu}>
					<Typography textAlign="center">Perfil</Typography>
				</MenuItem>
				<MenuItem key="Cerrar sesion" onClick={logout}>
					<Typography textAlign="center">Cerrar sesión</Typography>
				</MenuItem>
			</Menu>
		</Box>
	);
}
