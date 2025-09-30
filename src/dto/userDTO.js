export default class UserDTO {
  constructor(user) {
    if (user.id) this.id = user.id;
    if (user.username) this.username = user.username;
    if (user.password) this.password = user.password;
    if (user.image) this.image = user.image || 'default';
    if (user.admin) this.admin = user.admin ? true : false;
    if (user.active) this.active = user.active ? true : false;
    if (user.lastLogin) this.lastLogin = new Date(user.lastLogin + 'UTC');
    if (user.timeout) this.timeout = new Date(user.timeout + 'UTC');
  }
}
