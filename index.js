var debug = require("debug")("Worker")
var debugCron = require("debug")("Cron")
var mergeUpdateReport = require("./merge-update-report")
var CronJob = require('cron').CronJob;
var jackrabbit = require('jackrabbit');
var rabbit = jackrabbit(process.env.CLOUDAMQP_URL || "amqp://guest:guest@localhost:5672");

debug("starting index.js / cron process")

new CronJob({
  cronTime: process.env.CRONTAB,
  onTick: function() {
    debugCron("running merge-update-report.js")
    mergeUpdateReport()
  },
  start: true,
  timeZone: process.env.TZ
});

function onMessage(data){
  debug("message received with data:", data)
  mergeUpdateReport();
}

rabbit.default()
  .queue({ name: 'jobs' })
  .consume(onMessage, { noAck: true })
