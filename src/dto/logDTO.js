export default class Log {
  constructor(log) {
    this.timestamp = log.timestamp;
    this.level = log.level;
    this.id = log.id;
    this.action = log.action;
    this.description = log.description;
  }
}
