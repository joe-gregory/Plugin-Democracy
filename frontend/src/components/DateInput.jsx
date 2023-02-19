import { MuiTelInput } from "mui-tel-input";

export default function DateInput(props){
    const [phoneValue, setPhoneValue] = React.useState("");

    function handlePhoneChange(newValue, info) {
		setPhoneValue(newValue);
	}

    return (
        <MuiTelInput
            id="cellPhone"
            value={phoneValue}
            forceCallingCode="true"
            defaultCountry="MX"
            onlyCountries={["MX", "US"]}
            onChange={handlePhoneChange}
	    />
    )
}