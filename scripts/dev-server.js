const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const host = "localhost";
const preferredPort = Number(process.env.PORT || 5173);
const root = path.resolve(__dirname, "..");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function openBrowser(target) {
  const command =
    process.platform === "win32"
      ? `start "" "${target}"`
      : process.platform === "darwin"
        ? `open "${target}"`
        : `xdg-open "${target}"`;
  try {
    const child = exec(command, () => {});
    child.on("error", () => {
      console.log(`Open this URL in your browser: ${target}`);
    });
  } catch (e) {
    console.log(`Open this URL in your browser: ${target}`);
  }
}

function createServer() {
  return http.createServer((req, res) => {
    const requested = decodeURIComponent((req.url || "/").split("?")[0]);
    const relative = requested === "/" ? "Turako.html" : requested.replace(/^\/+/, "");
    const filePath = path.resolve(root, relative);

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  });
}

function listen(port, attemptsLeft = 10) {
  const server = createServer();

  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attemptsLeft > 0) {
      console.log(`Port ${port} is already in use. Trying ${port + 1}...`);
      listen(port + 1, attemptsLeft - 1);
      return;
    }
    throw err;
  });

  server.listen(port, host, () => {
    const url = `http://${host}:${port}/Turako.html`;
    console.log(`Turako is running at ${url}`);
    console.log("Press Ctrl+C to stop the dev server.");
    openBrowser(url);
  });
}

listen(preferredPort);
