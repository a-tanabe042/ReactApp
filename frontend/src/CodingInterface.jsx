import React, { useState, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import io from 'socket.io-client';
import './CodingInterface.css';
import CodeEditor from './components/CodeEditor';
import ConsoleOutput from './components/ConsoleOutput';
import ControlPanel from './components/ControlPanel';

function CodingInterface({sandbox}) {
    const [consoleContent, setConsoleContent] = useState('');
    const [panelWidthPercentage, setPanelWidthPercentage] = useState(50);  // 初期幅は50%
    const socket = useRef(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const containerRef = useRef(null);
    const [showPopup, setShowPopup] = useState(false);


    const handleExecute = useCallback(async (content) => {
      setIsExecuting(true);

      const endpoint = sandbox === 'javascript' 
                       ? 'http://localhost:3001/js-compile' 
                       : 'http://localhost:3001/react-compile';

      try {
          const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ code: content }),
          });

          const data = await response.json();

          if (data && data.containerPath) {
              socket.current = io(`http://localhost:${data.containerPath}`);
              socket.current.on("s2c_message", (msg) => {
                  setConsoleContent(msg.value);
                  if (socket.current) {
                      socket.current.disconnect();
                      socket.current = null;
                  }
              });
              socket.current.emit("c2s_message", { value: content });
          } else {
              console.error("Could not retrieve the container path");
          }
      } catch (error) {
          console.error("Error:", error);
      }
      setTimeout(() => setIsExecuting(false), 500);
  }, [sandbox]);
    

  const onDrag = (e, data) => {
    const containerWidth = containerRef.current.offsetWidth;
    const newPanelWidth = panelWidthPercentage + (data.deltaX / containerWidth) * 100;
    setPanelWidthPercentage(Math.min(100, Math.max(0, newPanelWidth)));
};

return (
    <div className="container" ref={containerRef}>
        <div className="left-panel" style={{ flexBasis: `${panelWidthPercentage}%` }}>
            <h1>2667. Create Hello World Function</h1>
            <p>Write a function createHelloWorld...</p>
            {/* ... Rest of the challenge content ... */}
        </div>

        <Draggable axis="x" onDrag={onDrag} bounds="parent">
            <div className="resize" />
        </Draggable>

        <div className="right-panel" style={{ flexBasis: `${100 - panelWidthPercentage}%` }}>
            <ControlPanel onExecute={handleExecute} isExecuting={isExecuting} />

            {/* The view button */}
            <button 
                onClick={() => setShowPopup(true)}
                style={{ 
                    backgroundColor: '#7752FE',
                    color: 'white', 
                    position: 'absolute',
                    top: 10, 
                    right: 10, 
                    borderRadius: '4px'  // ボタンのradiusを統一
                }}
            >
                View
            </button>

            {showPopup && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        zIndex: 10  // popupのz-indexを挙げる
                    }}
                >
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                        <p style={{color:'red'}}>test</p>
                        <button onClick={() => setShowPopup(false)}>Close</button>
                    </div>
                </div>
            )}

            <CodeEditor onExecute={handleExecute} />
            <ConsoleOutput content={consoleContent} />
        </div>
    </div>
);
}

export default CodingInterface;