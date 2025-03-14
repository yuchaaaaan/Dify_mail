const path = require('path');
const dotenv = require('dotenv');

// .envファイルの読み込み
const result = dotenv.config({ path: path.join(__dirname, '.env') });
if (result.error) {
    console.error('環境変数の読み込みに失敗しました:', result.error);
    process.exit(1);
}

// 必要なパッケージのインポート
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Expressアプリケーションの初期化
const app = express();
const port = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// DifyのAPIエンドポイントとAPIキー
const DIFY_API_URL = process.env.DIFY_API_URL;
const DIFY_API_KEY = process.env.DIFY_API_KEY;

// 環境変数の確認
console.log('環境変数の読み込み:', {
    DIFY_API_URL,
    DIFY_API_KEY: DIFY_API_KEY ? '設定済み' : '未設定',
    envPath: path.join(__dirname, '.env')
});

// ワークフローAPIエンドポイント
app.post('/api/workflow', async (req, res) => {
    try {
        const { mail_content } = req.body;
        console.log('受信したリクエスト:', { mail_content });

        if (!DIFY_API_URL || !DIFY_API_KEY) {
            throw new Error('Difyの設定が不完全です');
        }

        console.log('APIリクエスト送信:', {
            url: DIFY_API_URL,
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: {
                inputs: {
                    mail_content: mail_content
                },
                user: "web-user"
            }
        });

        const response = await axios.post(DIFY_API_URL, {
            inputs: {
                mail_content: mail_content
            },
            user: "web-user"
        }, {
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('APIレスポンス:', response.data);
        res.json({ result: response.data.data.outputs.text });
    } catch (error) {
        console.error('詳細なエラー情報:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
        res.status(500).json({ 
            error: 'ワークフローの実行中にエラーが発生しました',
            details: error.message 
        });
    }
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
    console.error('予期せぬエラー:', err);
    res.status(500).json({
        error: 'サーバーエラーが発生しました',
        details: err.message
    });
});

// 未処理のエラーハンドリング
process.on('uncaughtException', (err) => {
    console.error('未処理のエラー:', err);
    console.error('スタックトレース:', err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未処理のPromise rejection:', reason);
    console.error('スタックトレース:', reason.stack);
    process.exit(1);
});

// サーバーの起動
const server = app.listen(port, () => {
    console.log(`サーバーが起動しました: http://localhost:${port}`);
    console.log('環境変数:', {
        PORT: process.env.PORT,
        DIFY_API_URL: process.env.DIFY_API_URL,
        DIFY_API_KEY: process.env.DIFY_API_KEY ? '設定済み' : '未設定'
    });
});

// サーバーのエラーハンドリング
server.on('error', (err) => {
    console.error('サーバーエラー:', err);
    console.error('スタックトレース:', err.stack);
    process.exit(1);
}); 