const express = require("express");

const { prisma } = require("./db")
const {authenticateToken} = require("./middleware");

const router = express.Router();

// Search for videos by title
router.get('/search', async (req, res) => {
    try {
        const {q: searchTerm} = req.query;
        const videos = await prisma.video.findMany({
            where: {
                title: {
                    contains: searchTerm,
                    mode: 'insensitive', // Case-insensitive search
                },
            },
        });

        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Get a specific video by its ID
router.get('/:id', async (req, res) => {
    const videoId = parseInt(req.params.id);

    if (isNaN(videoId)) {
        return res.status(400).json({ error: `Invalid video ID: ${req.params.id}` });
    }

    try {
        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `An Unexpected Error occurred.` });
    }
});

// Get all videos with pagination support
router.get('/', async (req, res) => {
    try {
        let { page, pageSize } = req.query;
        page = parseInt(page) || 1;
        pageSize = parseInt(pageSize) || 3;
        const videos = await prisma.video.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

async function createVideo() {
    const videoData = {
        title: 'Video Seven',
        description: '7777777',
        publishedAt: new Date(),
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        videoUrl: 'https://example.com/video.mp4',
    }
    const newVideo = await prisma.video.create({data: videoData});

    console.log('Created video:', newVideo);
}


router.post("/create", async (req, res) => {
   await createVideo();
   return res.json({"status": "CREATED"});
});

module.exports = router;
