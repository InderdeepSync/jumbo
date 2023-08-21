
const express = require("express")

const {prisma} = require("./db")
const {authenticateToken} = require("./middleware");

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                watchLater: true, // Include the associated videos
            },
        });

        res.json(user.watchLater);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An Unexpected Error occurred.' });
    }
});

router.post('/:videoId', authenticateToken, async (req, res) => {
    const userId = req.userId;
    const videoId = parseInt(req.params.videoId);

    if (isNaN(videoId)) {
        return res.status(400).json({ error: `Invalid video ID: ${req.params.videoId}` });
    }

    try {
        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Check if the video already exists in the user's "Watch Later" list
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                watchLater: {
                    where: { id: parseInt(video.id) },
                },
            },
        });

        if (user?.watchLater.length > 0) {
            return res.status(400).json({ error: `Video ${videoId} already exists in User ${userId}'s Watch Later.` });
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                watchLater: {
                    connect: { id: video.id },
                },
            },
        });

        res.json({ message: `Video ${videoId} added to User ${userId}'s Watch Later.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

router.delete('/:videoId', authenticateToken, async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        // Check if the video exists
        const video = await prisma.video.findUnique({
            where: { id: parseInt(videoId) },
        });

        if (!video) {
            return res.status(404).json({ error: `Video ${videoId} does not exist` });
        }

        // Check if the video exists in the user's "Watch Later" list
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                watchLater: {
                    where: { id: parseInt(videoId) },
                },
            },
        });

        if (user?.watchLater.length === 0) {
            return res.status(400).json({ error: `Video ${videoId} does not exist in User ${userId}'s Watch Later.` });
        }

        // Remove the video from the user's "Watch Later" list
        await prisma.user.update({
            where: { id: userId },
            data: {
                watchLater: {
                    disconnect: { id: video.id },
                },
            },
        });

        res.json({ message: `Video ${videoId} removed from User ${userId}'s Watch Later.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

module.exports = router;