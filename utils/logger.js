/**
 * Configurations of logger.
 */
const { createLogger, format, transports } = require("winston");

const mainLogger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.timestamp({format:'MM/DD/YYYY hh:mm:ss.SSS'}),
    format.printf((info) => {
      return `${info.timestamp} : ${info.message}`;
    })
  ),
  transports: [new transports.Console()],
});

const DailyRotateFile = require("winston-daily-rotate-file");
mainLogger.configure({
  level: "info",
  transports: [
    new DailyRotateFile({
      name: "access-file",
      level: "info",
      filename: "./logs/server-%DATE%.log",
      datePattern: "yyyy-MM-DD",
      prepend: true,
      maxFiles: "14d",
    }),
  ],
});

module.exports = {
  mainLogger: mainLogger,
};
