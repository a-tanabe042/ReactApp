import './ConsoleOutput.css'

function ConsoleOutput({ content }) {
    return (
        <div className="console-output">
            <pre>{content}</pre>
        </div>
    );
}

export default ConsoleOutput;