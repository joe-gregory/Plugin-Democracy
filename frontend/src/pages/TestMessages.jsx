import { Typography } from "@mui/material";
import { useContext, useEffect } from "react";

import { RequestContext } from "../contexts/requests-context";

const TestMessages = () => {
	const request = useContext(RequestContext);
	useEffect(() => {
		request.request("get", "test-messages");
	}, []);
	return <Typography variant="h3">Messages Test</Typography>;
};

export default TestMessages;
