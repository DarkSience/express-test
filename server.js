const PORT = process.env.PORT || 3500;

const express = require("express");
const app = express();
const path = require("path");
const { logEvents } = require("./logEvents");
const EventEmitter = require("events");
const fs = require("fs");

class Emitter extends EventEmitter {}
const myEmitter = new Emitter();

myEmitter.on("log", (msg, fileName) => logEvents(msg, fileName));

app.set("trust proxy", true);

app.use((req, res, next) => {
    const userIP =
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.socket.remoteAddress;

    const method = req.method.padEnd(8, " ");
    const route = req.path.padEnd(60, " ");
    const ipStr = userIP.padEnd(16, " ");

    const message = `${method}${route}${ipStr}`;
    myEmitter.emit("log", message, "logs.txt");

    next();
});


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public copy")));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public copy", "index.html"));
});

app.get("/data-send", (req, res) => {
    res.sendFile(path.join(__dirname, "public copy", "data", "data.json"));
});

app.get("/old-data-send", (req, res) => {
    res.redirect(301, "https://www.google.com/");
});

app.get(/^\/hello(\.html)?$/, (req, res, next) => {
    console.log("Attempting to load hello.html");
    next();
}, (req, res) => {
    res.send("Haii");
});


app.get("/clear", (req, res) => {
    const folder = path.join(__dirname, "logs");

    if (!fs.existsSync(folder)) {
        return res.send("Logs folder does not exist.");
    }

    fs.rm(folder, { recursive: true, force: true }, (err) => {
        if (err) return res.status(500).send("Error clearing logs");
        res.send("Logs cleared successfully");
    });
});


app.get("/logs", (req, res) => {
    const filePath = path.join(__dirname, "logs", "logs.txt");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).send("Error reading logs: " + err.message);
        }
        res.type("text/plain").send(data);
    });
});


app.get(/\/*/, (req, res) => {
    res.status(404).send("Nothing here :3");
});

app.listen(PORT, () => console.log("Server running on port", PORT));
