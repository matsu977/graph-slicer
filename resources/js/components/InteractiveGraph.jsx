import React, { useState } from "react";
import GraphSlicer from "./GraphSlicer";

const InteractiveGraph = () => {
  // グラフを並べるための配列をState管理
  // 最初に1枚だけ入っているイメージ
    const [charts, setCharts] = useState([0]);

    const addChart = () => {
        setCharts((prev) => [...prev, prev.length]);
    };

    return (
        <div className="flex flex-col">

            {/* 横並び or 縦並びに表示 */}
            <div className="max-w-4xl mx-auto overflow-x-auto">
                <div className="grid grid-cols-2 gap-4">
                    {charts.map((chartKey, i) => (
                    <GraphSlicer key={chartKey} />
                    ))}
                </div>
            </div>

            {/* ＋ボタン */}
            <div className="mb-4">
                <button
                    onClick={addChart}
                    className="
                        px-4 py-2 
                        bg-indigo-500
                        font-bold
                        rounded 
                        shadow-lg 
                        hover:shadow-xl
                        active:shadow-none
                        active:translate-y-1
                        transition-all
                        duration-150
                        ease-in-out
                    "
                >
                ＋
                </button>
            </div>
        </div>
    );
};

export default InteractiveGraph;