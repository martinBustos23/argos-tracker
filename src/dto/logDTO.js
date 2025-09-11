export default class Log {
  constructor(log) {
    this.id = log.id;
    this.timestamp = new Date(log.timestamp + 'UTC');
    this.level = log.level;
    this.source = log.source;
    this.action = log.action;
    this.description = log.description;
  }
}
