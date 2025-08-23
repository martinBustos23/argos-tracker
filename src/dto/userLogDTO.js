export default class UserLog {
  constructor(log) {
    this.timestamp = log.timestamp;
    this.level = log.level;
    this.user = log.user;
    this.action = log.action;
    this.description = log.description;
    this.status = log.status;
  }
}
