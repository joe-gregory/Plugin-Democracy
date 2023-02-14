import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), basicSsl()],
	server: {
		proxy: {
			"pd/api": "http://localhost:8080",
		},
		host: true,
		https: true,
	},
});
