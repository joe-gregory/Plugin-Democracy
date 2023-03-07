import React from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
	width: "400px",
	height: "400px",
};

export default function GMap({ geoCoordinates, apiKey, options, zoom = 10 }) {
	const { isLoaded } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: apiKey,
	});

	const [map, setMap] = React.useState(null);

	const onLoad = React.useCallback(function callback(map) {
		const bounds = new window.google.maps.LatLngBounds({
			north: 32.494108,
			south: 32.4855651,
			west: -116.9868422,
			east: -116.9749761,
		});
		map.fitBounds(bounds);
		//map.setZoom(zoom);
		setMap(map);
	}, []);

	const onUnmount = React.useCallback(function callback(map) {
		setMap(null);
	}, []);
	return isLoaded ? (
		<GoogleMap
			mapContainerStyle={containerStyle}
			center={{
				lat: 32.4914478,
				lng: -116.981563,
			}}
			zoom={18}
			onLoad={onLoad}
			options={options}
			onUnmount={onUnmount}
		>
			{/* Child components, such as markers, info windows, etc. */}
			<></>
		</GoogleMap>
	) : (
		<></>
	);
}
