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
  const [headers, setHeaders] = useState([]); // CSVのヘッダー行を保存
  const [selectedXColumn, setSelectedXColumn] = useState(1); // X軸として選択された列のインデックス
  const [selectedYColumn, setSelectedYColumn] = useState(2); // Y軸として選択された列のインデックス

  // 表示用の文字列 state
  const [xAxisMinInput, setXAxisMinInput] = useState("");
  const [xAxisMaxInput, setXAxisMaxInput] = useState("");

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

  // ファイルアップロードの処理を更新
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');

      // おためし: 全行ログを出す
      lines.forEach((line, i) => {
        console.log(`Line[${i}]:`, line);
        console.log(`Split[${i}]:`, line.split(','));
      });
      
      const parsed = lines.slice(3)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          return {
            col1: parseFloat(values[1] || '0'), // B列
            col2: parseFloat(values[2] || '0')  // C列
          };
        });
      setData(parsed);

      // 軸の範囲を設定（B列のデータ）
      const xValues = parsed.map(point => point.col1);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      setXAxisDomain([xMin, xMax]);

      // Y軸の範囲を固定値に設定
      setYAxisDomain([0, 0.2]);  // ここで明示的に0から0.2に設定

      // ポインターの設定
      const newXPointers = [xMin + (xMax - xMin) * 0.3, xMin + (xMax - xMin) * 0.7];
      setXPointers(newXPointers);
    };
    reader.readAsText(file);
  };

  // 列選択の変更ハンドラー
  const handleColumnChange = (axis, value) => {
    const columnIndex = parseInt(value);
    if (axis === 'x') {
      setSelectedXColumn(columnIndex);
      // X軸の範囲のみ更新
      if (data.length > 0) {
        const values = data.map(point => point[`col${columnIndex}`]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        setXAxisDomain([min, max]);
        setXPointers([min + (max - min) * 0.3, min + (max - min) * 0.7]);
      }
    } else {
      setSelectedYColumn(columnIndex);
      // Y軸は固定値を維持
      setYAxisDomain([0, 0.2]);
    }
  };

  // Y軸の範囲設定（手動での変更用）
  const handleYAxisChange = (min, max) => {
    const newMin = parseFloat(min);
    const newMax = parseFloat(max);
    if (!isNaN(newMin) && !isNaN(newMax) && newMin < newMax) {
      setYAxisDomain([newMin, newMax]);
    }
  };


  const handleXAxisBlur = () => {
    const parsedMin = parseFloat(xAxisMinInput);
    const parsedMax = parseFloat(xAxisMaxInput);
    // ここでバリデーションしてから state を更新
    if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
      setXAxisDomain([parsedMin, parsedMax]);
    }
  };
  // X軸の範囲設定
  const handleXAxisChange = (min, max) => {
    const newMin = parseFloat(min);
    const newMax = parseFloat(max);

  // "NaN"ならとりあえず0や直前の値を使う
  setXAxisDomain([
    isNaN(newMin) ? xAxisDomain[0] : newMin,
    isNaN(newMax) ? xAxisDomain[1] : newMax
    ]);
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
        point[`col${selectedXColumn}`] >= Math.min(xPointers[0], xPointers[1]) &&
        point[`col${selectedXColumn}`] <= Math.max(xPointers[0], xPointers[1])
      );
      
      if (relevantData.length > 0) {
        const yValues = relevantData.map(point => point[`col${selectedYColumn}`]);
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
  }, [xPointers, yPointers, data, selectedXColumn, selectedYColumn]);

  // 参照線のクリックイベントを処理する関数
  const handleReferenceLineClick = (event, type, index) => {
    event.preventDefault();
    setDraggingPointer({ type, index });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    // active: ホバー中かどうか
    // payload: [{ name: "col2", value: データ値 }, ... ] のように配列で来る
    // label: X 軸の値 (例: “3.00”)
  
    if (!active || !payload || !payload.length) {
      return null; // マウスホバーが外れたときは表示しない
    }
  
    return (
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #cccccc", padding: "8px" }}>
        <p style={{ margin: 0 }}>X: {label}</p>
        <p style={{ margin: 0 }}>Y: {payload[0].value}</p>
      </div>
    );
  };

  // 追加: xPointersの変更を監視
  useEffect(() => {
    console.log('Updated xPointers:', xPointers); // デバッグ用ログ
  }, [xPointers]);

  return (
    <div className="w-full max-w-4xl p-4 border rounded-lg shadow-lg mx-auto">
      
      <div className="space-y-4">
        <div className="mb-6">
          <label className="block w-full">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="px-4 py-3 bg-white border-2 border-blue-200 hover:border-blue-400 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 group">
              
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                Upload CSV File
              </span>
            </div>
          </label>
        </div>
        
        {/* 列選択のドロップダウンを追加 */}
        {headers.length > 0 && (
          <div className="flex gap-4 mb-4 justify-center">
            <div>
              <label className="block text-sm">X軸の列:</label>
              <select
                value={selectedXColumn}
                onChange={(e) => handleColumnChange('x', e.target.value)}
                className="border p-1 rounded"
              >
                {headers.map((header, index) => (
                  <option key={`x-${index}`} value={index}>
                    {header || `列 ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm">Y軸の列:</label>
              <select
                value={selectedYColumn}
                onChange={(e) => handleColumnChange('y', e.target.value)}
                className="border p-1 rounded"
              >
                {headers.map((header, index) => (
                  <option key={`y-${index}`} value={index}>
                    {header || `列 ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <div className="flex gap-4 mb-4 justify-center">
            <div>
              <label className="block text-sm">X-Axis Min:</label>
              <input
                type="number"
                value={xAxisDomain[0]}
                onChange={(e) => {
                  // 入力されている文字列をfloat化
                  const newMin = parseFloat(e.target.value);
                  // NaNチェックを外す or 緩くする
                  setXAxisDomain([isNaN(newMin) ? 0 : newMin, xAxisDomain[1]]);
                }}
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
          <div className="flex justify-center">
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
                  dataKey="col1"
                  type="number" 
                  domain={xAxisDomain}
                  allowDataOverflow={true} // データが範囲外にはみ出した場合にも表示
                  stroke="#000"
                  strokeWidth={2}
                />
                <YAxis 
                  type="number"
                  domain={yAxisDomain}  // 直接値を指定せず、stateを使用
                  allowDataOverflow={true} // データが範囲外にはみ出した場合にも表示
                  stroke="#000"
                  strokeWidth={2}
                />
                
                <Tooltip content={<CustomTooltip />}/>
                <Line 
                  type="monotone" 
                  dataKey="col2"
                  stroke="#8884d8" 
                  dot={false} 
                />
                
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
          </div>
          {/* X軸参照線を動かすスライダー */}
          <div className="mt-4 flex justify-center mx-auto" style={{ width: chartWidth }}>
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

          <div className="flex gap-8 p-4 justify-center">
            {/* X-Range: 左寄せ */}
            <div className="w-48 border p-4 rounded space-y-4">
              <h3 className="font-bold mb-4">X-Range</h3>
              {xPointers.map((val, i) => (
                <div key={`x-${i}`} className="mb-2">
                  <input
                    type="number"
                    step="0.1"
                    value={val}
                    onChange={(e) => {
                      const newXPointers = [...xPointers];
                      newXPointers[i] = parseFloat(e.target.value);
                      setXPointers(newXPointers);
                    }}
                    className="border p-1 rounded w-full"
                  />
                </div>
              ))}
            </div>

            {/* Y-Range: X-Range の横 */}
            <div className="w-48 border p-4 rounded space-y-4">
              <h3 className="font-bold mb-4">Y-Range</h3>
              {yPointers.map((val, i) => (
                <div key={`y-${i}`} className="mb-2">
                  <input
                    type="number"
                    step="0.001"
                    value={val}
                    onChange={(e) => {
                      const newYPointers = [...yPointers];
                      newYPointers[i] = parseFloat(e.target.value);
                      setYPointers(newYPointers);
                    }}
                    className="border p-1 rounded w-full"
                  />
                </div>
              ))}
            </div>

            {/* Measurements: Y-Range の右 */}
            <div className="w-[1000px] rounded-lg bg-white shadow-md border border-gray-100">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-t-lg border-b">
                <h3 className="text-xl font-medium text-gray-800">Measurements</h3>
              </div>
              
              <div className="flex justify-center p-6 space-x-8">
                <div className="px-2 text-center rounded-lg">
                  <div className="inline-block text-gray-500 text-base mb-2">X Distance</div>
                  <div className="text-4xl font-bold text-indigo-600">
                    {measurements.xDistance.toFixed(2)}
                  </div>
                </div>
                
                <div className="px-2 text-center  rounded-lg">
                  <div className="inline-block text-gray-500 text-base mb-2">Y Distance</div>
                  <div className="text-4xl font-bold text-indigo-600">
                    {measurements.yDistance.toFixed(3)}
                  </div>
                </div>
                
                <div className="px-2 text-center rounded-lg">
                  <div className="inline-block text-gray-500 text-base mb-2">Maximum</div>
                  <div className="text-4xl font-bold text-indigo-600">
                    {measurements.yMax.toFixed(3)}
                  </div>
                </div>
                
                <div className="px-2 text-center rounded-lg">
                  <div className="inline-block text-gray-500 text-base mb-2">Minimum</div>
                  <div className="text-4xl font-bold text-indigo-600">
                    {measurements.yMin.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        
      </div>
    </div>
  );
};

export default InteractiveGraph;