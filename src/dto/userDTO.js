export default class UserDTO {
  constructor(user) {
    this.username = user.username;
    this.password = user.password;
    this.image = user.image;
    this.admin = user.admin ? true : false;
    this.active = user.active ? true : false;
    if (user.lastLogin) this.lastLogin = new Date(user.lastLogin + 'UTC');
    if (user.timeout) this.timeout = new Date(user.timeout + 'UTC');
  }
}
