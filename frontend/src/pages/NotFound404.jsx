import { Container, Box, Paper, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFound404() {
	const theme = useTheme();
	return (
		<Container component="main" maxWidth="xs" sx={{ mt: 5 }}>
			<Box>
				<Paper elevation={24} sx={{ mb: 5 }}>
					<Typography
						variant="h1"
						textAlign="center"
						style={{ color: theme.palette.primary.main }}
						sx={{ fontWeight: 300 }}
					>
						Page Not Found
					</Typography>
				</Paper>
			</Box>
			<Box display="flex" justifyContent="center" alignItems="center">
				<Link to="/" style={{ textDecoration: "none" }}>
					<Button variant="contained">Go back to Home</Button>
				</Link>
			</Box>
		</Container>
	);
}
