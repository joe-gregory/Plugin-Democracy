async function request(method = "get", subdirectory = "/", body) {
	//fetches and returns json response
	method = method.toLowerCase();
	subdirectory = subdirectory.toLowerCase();
	if (subdirectory[0] !== "/") subdirectory = "/" + subdirectory;
	let methods = ["get", "post"];
	if (!methods.includes(method)) throw new Error("Unknown http method");
	const domain = "https://192.168.1.68:8080";
	const url = domain + subdirectory;

	const response = await fetch(url, {
		method: method,
		headers: {
			"Content-Type": "application/json",
		},
		body: body,
		mode: "cors",
		credentials: "include",
	});

	const jsonresponse = await response.json();
	//console.log(jsonresponse);

	return jsonresponse;
}

export { request };
