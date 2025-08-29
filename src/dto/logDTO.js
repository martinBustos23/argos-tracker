export default class Log {
  constructor(log) {
    this.id = log.id;
    this.timestamp = log.timestamp;
    this.level = log.level;
    this.source = log.source;
    this.action = log.action;
    this.description = log.description;
  }
}
