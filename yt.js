const axios = require("axios");
const { prisma } = require("./db");

const apiKey = process.env.YOUTUBE_API_KEY

function getRFC3339DateTimeTwoHoursAgo() {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours in milliseconds

    const year = twoHoursAgo.getUTCFullYear();
    const month = String(twoHoursAgo.getUTCMonth() + 1).padStart(2, '0');
    const day = String(twoHoursAgo.getUTCDate()).padStart(2, '0');
    const hours = String(twoHoursAgo.getUTCHours()).padStart(2, '0');
    const minutes = String(twoHoursAgo.getUTCMinutes()).padStart(2, '0');
    const seconds = String(twoHoursAgo.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

async function fetchVideos() {
    console.log("TimeStamp: ", new Date());
    console.log('Fetching YouTube videos...');
    const twoHoursAgo = getRFC3339DateTimeTwoHoursAgo();

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: apiKey,
                order: 'date',
                publishedAfter: twoHoursAgo,
                maxResults: 50,
                part: 'snippet',
            },
        });

        const videos = response.data.items;
        console.log('Fetched videos:', videos);
        let videoList = videos.map(video => {
            const {
                id: {videoId},
                snippet: {publishedAt, title, description, thumbnails: {default: {url: thumbnailUrl}}}
            } = video;
            const videoUrl = `https://youtube.com/watch?v=${videoId}`
            return {
                publishedAt, title, description, thumbnailUrl, videoUrl
            }

        })
        const savedVideos = await prisma.video.createMany({
            data: videoList,
        });
        console.log("Videos saved to Database:", videoList);
    } catch (error) {
        console.error('Error fetching videos:', error.message);
    }
}

module.exports = {fetchVideos};