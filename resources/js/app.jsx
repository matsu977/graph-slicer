import "./bootstrap";
import "../css/app.css";

import ReactDOM from "react-dom/client";
import GraphSlicer from "./components/GraphSlicer";


function App() {
    return (
        <div>
            <GraphSlicer />
        </div>
    );

}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);