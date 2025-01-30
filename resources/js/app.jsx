import "./bootstrap";
import "../css/app.css";

import ReactDOM from "react-dom/client";
import InteractiveGraph from "./components/InteractiveGraph";


function App() {
    return (
        <div>
            <InteractiveGraph />
        </div>
    );

}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);