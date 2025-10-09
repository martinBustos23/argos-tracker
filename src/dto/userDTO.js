export default class UserDTO {
  constructor(user) {
    if (user.id) this.id = user.id;
    if (user.username) this.username = user.username;
    if (user.password) this.password = user.password;
    if (user.image) this.image = user.image || 'default';
    if (user.admin || user.admin === false) this.admin = user.admin == true ? true : false;
    if (user.active || user.active === false) this.active = user.active == true ? true : false;
    if (user.lastLogin) this.lastLogin = new Date(user.lastLogin);
    if (user.timeout) this.timeout = new Date(user.timeout);
  }
}
