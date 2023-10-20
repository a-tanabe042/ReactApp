const express = require('express');
const socketIO = require('socket.io');
const { spawn } = require('child_process');

const app = express();
const server = app.listen(8079);
// socket.ioのサーバーをセットアップし、CORS設定を適用
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// クライアントがsocket.ioに接続したときのイベントハンドラ
io.on('connection', (socket) => {
  console.log('User connected');

  // クライアントからのメッセージを受け取ったときのイベントハンドラ
  socket.on('c2s_message', async (data) => {
    try {
      const result = await executeCode(data.value);
      // クライアントに実行結果を返送
      socket.emit('s2c_message', { value: result });
    } catch (error) {
      // エラーが発生した場合、エラーメッセージをクライアントに返送
      socket.emit('s2c_message', { value: `Error: ${error.message}` });
    }
  });
});

// 与えられたコードを子プロセスとして実行する関数
async function executeCode(code) {
  return new Promise((resolve, reject) => {
    // nodeプロセスを子プロセスとしてスポーン
    const child = spawn('node', ['-e', code]);
    let result = '';
    let errorData = '';

    // 標準出力からのデータを受け取る
    child.stdout.on('data', (data) => result += data);
    // 標準エラーからのデータを受け取る
    child.stderr.on('data', (data) => errorData += data);
    // 子プロセスが終了したときの処理
    child.on('exit', () => errorData ? reject(new Error(errorData)) : resolve(result));
  });
}
