import React, {useState} from "react"

const Config = (props) => {
    const [settings, setSettings] = useState(props.settings)

    return (
        <div style={props.style}>
            {"ALERT URL"}
            <input value={settings.alertUrl} onChange={(e) => {
                const {value} = e.target
                setSettings((prevSettings) => ({
                    ...prevSettings,
                    alertUrl: value
                }))
            }}/>
            {"MINIMUM CONFIDENCE"}
            <input type={"number"} value={settings.minimumConfidence} min={0} max={1} step={0.01} onChange={(e) => {
                const {value} = e.target
                setSettings((prevSettings) => ({
                    ...prevSettings,
                    minimumConfidence: value
                }))
            }}/>
            {"SEND IMAGE WITH ALERT"}
            <input type={"checkbox"} checked={settings.sendImageWithAlert} onClick={(e) => {
                const {checked} = e.target
                setSettings((prevSettings) => ({
                    ...prevSettings,
                    sendImageWithAlert: checked
                }))
            }}/>
            <button onClick={() => setSettings(props.settings)}>RESET</button>
            <button onClick={() => props.setSettings(settings)}>SET</button>
        </div>
    )

}

export default Config