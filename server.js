require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// DifyのAPIエンドポイントとAPIキー
const DIFY_API_URL = process.env.DIFY_API_URL;
const DIFY_API_KEY = process.env.DIFY_API_KEY;

// ワークフローAPIエンドポイント
app.post('/api/workflow', async (req, res) => {
    try {
        const { mail_content } = req.body;

        if (!DIFY_API_URL || !DIFY_API_KEY) {
            throw new Error('Difyの設定が不完全です');
        }

        const response = await axios.post(DIFY_API_URL, {
            inputs: {
                mail_content: mail_content
            }
        }, {
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ result: response.data.result });
    } catch (error) {
        console.error('エラー:', error);
        res.status(500).json({ 
            error: 'ワークフローの実行中にエラーが発生しました',
            details: error.message 
        });
    }
});

// サーバーの起動
app.listen(port, () => {
    console.log(`サーバーが起動しました: http://localhost:${port}`);
}); 