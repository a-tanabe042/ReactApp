
import React, { useState } from 'react'
/**
 * Buttonコンポーネントは、クリックされるとカウントを1増やすボタンを表示します。
 * @function Button
 * @returns {JSX.Element}
 */
const Button = () => {
    const [count, setCount] = useState(0);

    /**
     * ボタンがクリックされた時にカウントを1増やす関数
     * @function handleClick
     * @returns {void}
     */
    const handleClick = () => {
        setCount(count + 1);
    };

    return (
        <div className="flex flex-col items-center">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleClick}
            >
                test
            </button>
            <div className="mt-4 text-lg font-bold">{count}</div>
        </div>
    );
};

export default Button;
