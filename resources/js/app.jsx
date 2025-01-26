import "./bootstrap";
import "../css/app.css";


import ReactDOM from "react-dom/client";
import GraphSlicer from "./components/GraphSlicer";

function App() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* ヘッダー */}
            <header className="bg-blue-600 text-white p-4 shadow-md flex items-center">
                <div className="flex items-center">
                    {/* ロゴ画像の追加 */}
                    <img src="/images/slicer.png" alt="Logo" className="w-10 h-10 mr-3" />
                    <h1 className="text-2xl font-bold">GraphSlicer</h1>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="flex-grow p-4">
                <GraphSlicer />
            </main>

            {/* フッター */}
            <footer className="bg-gray-800 text-white p-4 text-center">
                <p>&copy; GraphSlicer. All rights reserved.</p>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);