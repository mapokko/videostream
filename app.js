const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

// app.use(express.static(path.join(__dirname, "../build")));

app.get("/mock", (req, res) => {
  res.send("hello world");
});

app.get("/video", (req, res) => {
  const filePath = path.resolve(__dirname, "./videos/myvideo.mkv");
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const contentType = "video/x-matroska";

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": contentType,
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// app.get("/*", (req, res) => {
//   console.log("gotten");
//   res.sendFile(path.join(__dirname, "../build", "index.html"));
// });

app.listen(5000, () => console.log("Server listening on port 5000!"));
