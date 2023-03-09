import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";

import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import AddCommentIcon from "@mui/icons-material/AddComment";
import EmailIcon from "@mui/icons-material/Email";
import { Link } from "react-router-dom";

export default function Footer() {
	const [value, setValue] = React.useState(2);
	const ref = React.useRef(null);

	return (
		<Box sx={{ pb: 7 }} ref={ref}>
			<Paper
				sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
				elevation={3}
			>
				<BottomNavigation
					showLabels
					value={value}
					onChange={(event, newValue) => {
						setValue(newValue);
					}}
				>
					<BottomNavigationAction
						label="Community Feed"
						icon={<DynamicFeedIcon />}
						disabled={true}
					/>
					<BottomNavigationAction
						label="Create Proposal"
						icon={<AddCommentIcon />}
						disabled={true}
					/>
					<BottomNavigationAction
						label="Contact Support"
						icon={<EmailIcon />}
						component={Link}
						to="/contact"
					/>
				</BottomNavigation>
			</Paper>
		</Box>
	);
}
