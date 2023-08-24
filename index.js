const express = require('express');
const cron = require("node-cron")

const app = express();
app.use(express.json());

const authRouter = require("./auth")
app.use("/", authRouter)

const videosRouter = require("./video");
app.use("/videos", videosRouter);

const watchLaterRouter = require("./watchLater");
app.use("/watch-later", watchLaterRouter);

const {fetchVideos} = require("./yt")

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

cron.schedule("0 */2 * * *", fetchVideos);
// cron.schedule("*/10 * * * * *", fetchVideos)
