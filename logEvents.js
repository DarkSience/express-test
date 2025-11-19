const { format } = require("date-fns");
const { v4: uuid } = require("uuid");

const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvents = async (message, fileName) => {

  const date = format(new Date(), "yyyyMMdd").padEnd(12, " ");
  const time = format(new Date(), "HH:mm:ss").padEnd(10, " ");
  const id = uuid().padEnd(40, " ");

  const logItem = `${date}${time}${id}${message}`;

  console.log(logItem);

  try {
    const logDir = path.join(__dirname, "logs");
    if (!fs.existsSync(logDir)) {
      await fsPromises.mkdir(logDir);
    }

    await fsPromises.appendFile(
      path.join(logDir, fileName),
      logItem + "\n"
    );
  } catch (err) {
    console.error(err);
  }
};

module.exports = { logEvents };
