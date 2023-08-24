const axios = require("axios");
const { prisma } = require("./db");

const apiKey = process.env.YOUTUBE_API_KEY

function getRFC3339DateTimeTenMinutesAgo() {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes in milliseconds

    const year = tenMinutesAgo.getUTCFullYear();
    const month = String(tenMinutesAgo.getUTCMonth() + 1).padStart(2, '0');
    const day = String(tenMinutesAgo.getUTCDate()).padStart(2, '0');
    const hours = String(tenMinutesAgo.getUTCHours()).padStart(2, '0');
    const minutes = String(tenMinutesAgo.getUTCMinutes()).padStart(2, '0');
    const seconds = String(tenMinutesAgo.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

async function fetchVideos() {
    console.log("TimeStamp: ", new Date());
    console.log('Fetching YouTube videos...');

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: apiKey,
                order: 'date',
                publishedAfter: getRFC3339DateTimeTenMinutesAgo(),
                maxResults: 3,
                part: 'snippet',
            },
        });

        const { items: videos } = response.data;
        let videoList = videos.map(video => {
            const {
                id: {videoId},
                snippet: {publishedAt, title, description, thumbnails: {default: {url: thumbnailUrl}}}
            } = video;
            const videoUrl = `https://youtube.com/watch?v=${videoId}`;
            return {
                publishedAt, title, description, thumbnailUrl, videoUrl
            };
        });
        const savedVideos = await prisma.video.createMany({
            data: videoList,
        });
        console.log("Videos fetched & saved to Database:", videoList);
        return videoList;
    } catch (error) {
        console.error('Error fetching videos:', error.message);
    }
}

module.exports = {fetchVideos};