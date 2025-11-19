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


app.use((req, res, next) => {

    next();
});


app.use(async (req, res, next) => {
    try {
        const response = await fetch("https://api.ipify.org");
        const ip = await response.text();

        const method = req.method.padEnd(8, " ");
        const route = req.path.padEnd(60, " ");
        const ipStr = ip.padEnd(10, " ");

        const message = `${method}${route}${ipStr}`;
        myEmitter.emit("log", message, "logs.txt");
    } catch (err) {
        console.log("IP fetch error:", err);
    }
    next();
});


app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public copy")));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public copy", "index.html"));
});
app.get("/data-send", (req, res) => {
    res.sendFile(path.join(__dirname, "public copy", "data", "data.json"));
});
app.get("/old-data-send", (req, res) => {
    res.redirect(301,"https://www.google.com/");
});

app.get(/^\/hello(\.html)?$/, (req, res, next) => {
        console.log("Attempting to load hello.html");
        next();
}, (req, res) => {
    res.send("Haii");
})

app.get("/clear", (req, res) => {
    if(fs.existsSync(path.join(__dirname, "logs"))){
        fs.rm(path.join(__dirname, "logs"), { recursive: true, force: true }, (err) => {
            if (err) return res.status(500).send("Error clearing logs");
            res.send("Logs cleared successfully");
        });
    }
});

app.get(/\/*/, (req, res) => {
    res.status(404).send("Nothing here :3");
})



app.listen(PORT, () => console.log("Server running on port ", PORT));