const express = require('express');

const app = express();
app.use(express.json());

const authRouter = require("./auth")
app.use("/", authRouter)

const videosRouter = require("./video");
app.use("/videos", videosRouter);

const watchLaterRouter = require("./watchLater");
app.use("/watch-later", watchLaterRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
