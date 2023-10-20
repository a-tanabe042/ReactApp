import React, { useState, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import './CodeEditor.css';

function CodeEditor({ onExecute }) {
    const [activeTab, setActiveTab] = useState('script.js');
    const [codeContent, setCodeContent] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 新しい状態変数

    const editorRef = useRef(null);
    const codeRefs = {
        'script.js': useRef('1'),
        'animal.js': useRef('2'),
        'dog.js': useRef('3')
    };

    const handleTabChange = async (tab) => {
        setIsLoading(true); // タブの切り替えを開始
        if (editorRef.current) {
            codeRefs[activeTab].current = editorRef.current.getValue();
            await setCodeContent(codeRefs[tab].current || '');
            setActiveTab(tab);
        }
        // 500ミリ秒の遅延を追加
        setTimeout(() => {
            setIsLoading(false); // タブの切り替えを完了
        }, 50);
    };

    const handleExecute = () => {
        if (editorRef.current) {
            onExecute(editorRef.current.getValue());
        }
    };

    return (
        <div>
            <div className="tabs">
                {Object.keys(codeRefs).map(tab => (
                    <button 
                        key={tab} 
                        disabled={isLoading}
                        className={activeTab === tab ? 'active' : ''} 
                        onClick={() => handleTabChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
                <button 
                    disabled={isLoading}
                    style={{ 
                        marginLeft: 'auto', 
                        backgroundColor: '#A7D397', 
                        color: '#333',
                        fontWeight: 'bold',
                        border: 'none',
                        padding: '5px 15px',
                        borderRadius: '5px'
                    }}
                    onClick={handleExecute}
                >
                    ▶️ Run
                </button>
            </div>
            <Editor 
                value={codeContent}
                height="500px" 
                theme="vs-dark" 
                language="javascript" 
                onMount={(editor) => {
                    editorRef.current = editor;
                    if (codeRefs[activeTab].current) {
                        editor.setValue(codeRefs[activeTab].current);
                    }
                }}
                onChange={(value) => {
                    codeRefs[activeTab].current = value;
                }}
            />
        </div>
    );
}

export default CodeEditor;
