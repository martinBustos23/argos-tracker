export default class Log {
  constructor(log) {
    if (log.id) this.id = log.id;
    if (log.timestamp) this.timestamp = new Date(log.timestamp + 'UTC');
    if (log.level) this.level = log.level;
    if (log.source) this.source = log.source;
    if (log.action) this.action = log.action;
    if (log.description) this.description = log.description;
  }
}
