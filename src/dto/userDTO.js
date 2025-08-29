export default class UserDTO {
  constructor(user) {
    this.username = user.username;
    this.password = user.password;
    this.admin = user.admin;
    this.active = user.active;
    this.lastLogin = user.lastLogin == null ? "Todavia no logueado" : user.lastLogin;
  }
}
