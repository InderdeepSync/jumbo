-- CreateTable
CREATE TABLE "_UserToVideo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserToVideo_AB_unique" ON "_UserToVideo"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToVideo_B_index" ON "_UserToVideo"("B");

-- AddForeignKey
ALTER TABLE "_UserToVideo" ADD CONSTRAINT "_UserToVideo_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToVideo" ADD CONSTRAINT "_UserToVideo_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
