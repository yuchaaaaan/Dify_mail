document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('workflowForm');
    const resultDiv = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const mailContent = document.getElementById('mail_content').value;
        resultDiv.textContent = '処理中...';

        try {
            const response = await fetch('/api/workflow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mail_content: mailContent }),
            });

            if (!response.ok) {
                throw new Error('APIリクエストに失敗しました');
            }

            const data = await response.json();
            resultDiv.textContent = data.result;
        } catch (error) {
            resultDiv.textContent = `エラーが発生しました: ${error.message}`;
        }
    });
}); 