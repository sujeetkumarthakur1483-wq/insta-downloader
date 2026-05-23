const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.post('/api/download', async (req, res) => {
    const { inputData } = req.body;

    if (!inputData) {
        return res.status(400).json({ error: 'Kripya Link ya Source Code dalein!' });
    }

    // 1. PUBLIC URL DETECT
    if (inputData.startsWith('http://') || inputData.startsWith('https://')) {
        try {
            const options = {
                method: 'GET',
                url: 'https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index',
                params: { url: inputData },
                headers: {
                    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY_HERE', // <--- RapidAPI account banakar baad me yahan apni key lagana
                    'X-RapidAPI-Host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com'
                }
            };
            const response = await axios.request(options);
            if (response.data && response.data.media) {
                return res.json({ downloadUrl: response.data.media, type: 'public' });
            } else {
                return res.status(404).json({ error: 'Video nahi mili. Agar private video hai toh source code paste karein.' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Public link process karne me dikkat aayi.' });
        }
    } 
    
    // 2. PRIVATE SOURCE CODE DETECT
    else {
        try {
            const videoUrlMatch = inputData.match(/"video_url":"([^"]+)"/) || inputData.match(/property="og:video" content="([^"]+)"/);
            
            if (videoUrlMatch && videoUrlMatch[1]) {
                let cleanUrl = videoUrlMatch[1].replace(/\\u0026/g, '&');
                return res.json({ downloadUrl: cleanUrl, type: 'private' });
            } else {
                return res.status(404).json({ error: 'Source code me video link nahi mila.' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Private code process karne me dikkat aayi.' });
        }
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
