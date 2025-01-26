import React, { useState, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
} from 'recharts';


const InteractiveGraph = () => {
  const [data, setData] = useState([]);
  const [yAxisDomain, setYAxisDomain] = useState([0, 0.2]);
  const [xAxisDomain, setXAxisDomain] = useState([0, 100]);
  const [xPointers, setXPointers] = useState([20, 60]);
  const [yPointers, setYPointers] = useState([0.06, 0.12]);

  
  const [measurements, setMeasurements] = useState({
    xDistance: 0,
    yDistance: 0,
    yMax: 0,
    yMin: 0
  });
  
  const chartContainerRef = useRef(null);
  const [draggingPointer, setDraggingPointer] = useState(null);
  const chartMargin = { top: 20, right: 30, left: 60, bottom: 60 };
  const chartWidth = 800;
  const chartHeight = 400;

  // ファイルアップロードの処理
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      
      // 1行目をスキップしてデータをパース
      const parsed = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const [x, y] = line.split(',');
          return { x: parseFloat(x), y: parseFloat(y) };
        });
      setData(parsed);

      // 手動でY軸の範囲を設定
      setYAxisDomain([0, 0.2]); // 例: 0 ～ 0.2 に固定
      
      // データに基づいてX軸の範囲を設定
      const xValues = parsed.map(point => point.x);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      console.log('xMin:', xMin, 'xMax:', xMax); // デバッグ用ログ
      setXAxisDomain([xMin, xMax]);

      // ポインターの設定
      const newXPointers = [xMin + (xMax - xMin) * 0.3, xMin + (xMax - xMin) * 0.7];
      console.log('New xPointers:', newXPointers); // デバッグ用ログ
      setXPointers(newXPointers);
    };
    reader.readAsText(file);
  };

  // Y軸の範囲設定
  const handleYAxisChange = (min, max) => {
    setYAxisDomain([parseFloat(min), parseFloat(max)]);
  };

  // X軸の範囲設定
  const handleXAxisChange = (min, max) => {
    setXAxisDomain([parseFloat(min), parseFloat(max)]);
  };

  // マウス位置をグラフ座標に変換
  const getGraphCoordinates = (event) => {
    const container = chartContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left - chartMargin.left;
    const y = event.clientY - rect.top - chartMargin.top;
    
    const xScale = (chartWidth - chartMargin.left - chartMargin.right) / (xAxisDomain[1] - xAxisDomain[0]);
    const yScale = (chartHeight - chartMargin.top - chartMargin.bottom) / (yAxisDomain[1] - yAxisDomain[0]);
    
    return {
      x: (x / xScale) + xAxisDomain[0],
      y: yAxisDomain[1] - (y / yScale)
    };
  };

  // ドラッグ開始
  const handlePointerMouseDown = (pointerType, index, event) => {
    event.preventDefault();
    setDraggingPointer({ type: pointerType, index });
  };

  // ドラッグ中
  const handleMouseMove = (event) => {
    if (!draggingPointer) return;
    
    const coords = getGraphCoordinates(event);
    if (draggingPointer.type === 'x') {
      const newXPointers = [...xPointers];
      newXPointers[draggingPointer.index] = Math.max(xAxisDomain[0], Math.min(xAxisDomain[1], coords.x));
      setXPointers(newXPointers);
    } else if (draggingPointer.type === 'y') {
      const newYPointers = [...yPointers];
      newYPointers[draggingPointer.index] = Math.max(yAxisDomain[0], Math.min(yAxisDomain[1], coords.y));
      setYPointers(newYPointers);
    }
  };

  // ドラッグ終了
  const handleMouseUp = () => {
    setDraggingPointer(null);
  };

  // 測定値の計算
  useEffect(() => {
    // X軸とY軸の距離を計算
    const xDist = Math.abs(xPointers[1] - xPointers[0]);
    const yDist = Math.abs(yPointers[1] - yPointers[0]);
    
    // データがある場合のみY値の最大最小を計算
    let yMax = 0;
    let yMin = 0;
    
    if (data.length > 0) {
      const relevantData = data.filter(point => 
        point.x >= Math.min(xPointers[0], xPointers[1]) &&
        point.x <= Math.max(xPointers[0], xPointers[1])
      );
      
      if (relevantData.length > 0) {
        const yValues = relevantData.map(point => point.y);
        yMax = Math.max(...yValues);
        yMin = Math.min(...yValues);    
      }
    }

    setMeasurements({
      xDistance: xDist,
      yDistance: yDist,
      yMax,
      yMin
    });
  }, [xPointers, yPointers, data]);

  // 参照線のクリックイベントを処理する関数
  const handleReferenceLineClick = (event, type, index) => {
    event.preventDefault();
    setDraggingPointer({ type, index });
  };

  // 追加: xPointersの変更を監視
  useEffect(() => {
    console.log('Updated xPointers:', xPointers); // デバッグ用ログ
  }, [xPointers]);

  return (
    <div className="w-full max-w-4xl p-4 border rounded-lg shadow-lg">
      
      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mb-4"
          />
        </div>
        
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm">X-Axis Min:</label>
            <input
              type="number"
              value={xAxisDomain[0]}
              onChange={(e) => handleXAxisChange(e.target.value, xAxisDomain[1])}
              step="1"
              className="border p-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">X-Axis Max:</label>
            <input
              type="number"
              value={xAxisDomain[1]}
              onChange={(e) => handleXAxisChange(xAxisDomain[0], e.target.value)}
              step="1"
              className="border p-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Y-Axis Min:</label>
            <input
              type="number"
              value={yAxisDomain[0]}
              onChange={(e) => handleYAxisChange(e.target.value, yAxisDomain[1])}
              step="0.01"
              className="border p-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Y-Axis Max:</label>
            <input
              type="number"
              value={yAxisDomain[1]}
              onChange={(e) => handleYAxisChange(yAxisDomain[0], e.target.value)}
              step="0.01"
              className="border p-1 rounded"
            />
          </div>
        </div>

        <div 
          ref={chartContainerRef}
          className="relative cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <LineChart
            width={chartWidth}
            height={chartHeight}
            data={data}
            margin={chartMargin}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="x" 
              type="number" 
              domain={xAxisDomain}
              stroke="#000"
              strokeWidth={2}
            />
            <YAxis 
              domain={yAxisDomain}
              stroke="#000"
              strokeWidth={2}
            />
            
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#8884d8" dot={false} />
            
            {/* X軸参照線 */}
            {xPointers.map((x, i) => (
              <ReferenceLine 
                key={`x-ref-${i}`}
                x={x}
                stroke="#0066cc"
                strokeWidth={2}
                strokeDasharray="5 5"
                style={{ cursor: 'col-resize', opacity: 0.6 }}
                onClick={(e) => handleReferenceLineClick(e, 'x', i)}
              />
            ))}
            
            {/* Y軸参照線 */}
            {yPointers.map((y, i) => (
              <ReferenceLine 
                key={`y-ref-${i}`}
                y={y}
                stroke="#cc0000"
                strokeWidth={2}
                strokeDasharray="5 5"
                style={{ cursor: 'row-resize', opacity: 0.6 }}
                onClick={(e) => handleReferenceLineClick(e, 'y', i)}
              />
            ))}
          </LineChart>
        </div>

        {/* X軸参照線を動かすスライダー */}
        <div className="mt-4 flex justify-center" style={{ width: chartWidth }}>
          <h3 className="font-bold mb-2">X-Axis Slicer</h3>
          {xPointers.map((val, i) => (
            <div key={`slider-x-${i}`} className="mb-2" style={{ width: '30%' }}>
              <input
                type="range"
                min={xAxisDomain[0]}
                max={xAxisDomain[1]}
                value={val}
                step="0.1"
                onChange={(e) => {
                  const newXPointers = [...xPointers];
                  newXPointers[i] = parseFloat(e.target.value);
                  setXPointers(newXPointers);
                }}
                className="w-full"
                style={{
                  appearance: 'none',
                  width: '100%',
                  height: '4px',
                  background: '#ccc', // トラックの色を灰色に設定
                  outline: 'none',
                  opacity: '0.7',
                  transition: 'opacity .15s ease-in-out',
                }}
              />
              <style jsx>{`
                input[type='range']::-webkit-slider-thumb {
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  background: #0066cc; // スライダーのつまみの色を青に設定
                  cursor: pointer;
                  border-radius: 50%;
                }
                input[type='range']::-moz-range-thumb {
                  width: 16px;
                  height: 16px;
                  background: #0066cc; // スライダーのつまみの色を青に設定
                  cursor: pointer;
                  border-radius: 50%;
                }
              `}</style>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold mb-2">X-Range</h3>
            {xPointers.map((val, i) => (
              <div key={`x-${i}`} className="mb-2">
                <input
                  type="number"
                  step="0.1" 
                  value={val} // 数値そのまま渡す
                  onChange={(e) => {
                    const newXPointers = [...xPointers];
                    newXPointers[i] = parseFloat(e.target.value);
                    setXPointers(newXPointers);
                  }}
                  className="border p-1 rounded"
                />
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-bold mb-2">Y-Range</h3>
            {yPointers.map((val, i) => (
              <div key={`y-${i}`} className="mb-2">
                <input
                  type="number"
                  step="0.001" // 小数点第3位までの入力を許可
                  value={val} // 数値そのまま渡す
                  onChange={(e) => {
                    const newYPointers = [...yPointers];
                    newYPointers[i] = parseFloat(e.target.value);
                    setYPointers(newYPointers);
                  }}
                  className="border p-1 rounded"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Measurements</h3>
          <div>X-Axis Distance: {measurements.xDistance.toFixed(2)}</div>
          <div>Y-Axis Distance: {measurements.yDistance.toFixed(3)}</div>
          <div>Y-Axis Max: {measurements.yMax.toFixed(3)}</div>
          <div>Y-Axis Min: {measurements.yMin.toFixed(3)}</div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveGraph;