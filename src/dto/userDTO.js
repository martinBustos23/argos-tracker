export default class UserDTO {
  constructor(user) {
    this.username = user.username;
    this.password = user.password;
    this.admin = user.admin;
    this.active = user.active;
    this.lastLogin = new Date(user.lastLogin + 'UTC');
    this.timeout = user.timeout && new Date(user.timeout + 'UTC');
  }
}
