export default class SystemConfig {
  constructor(config) {
    if (config.general) {
      this.general = {};
      if (config.general.lang) this.general.lang = config.general.lang;
      if (config.general.timezone) this.general.timezone = config.general.timezone;
      if (config.general.timeFormat) this.general.timeFormat = config.general.timeFormat;
    }
    if (config.devices) {
      this.devices = {};
      if (config.devices.seeDisabled) this.devices.seeDisabled = config.devices.seeDisabled;
    }
    if (config.location) {
      this.location = {};
      if (config.location.city) this.location.city = config.location.city;
      if (config.location.zoom) this.location.zoom = config.location.zoom;
    }
    if (config.network) {
      this.network = {};
      if (config.network.wifiSsid) this.network.wifiSsid = config.network.wifiSsid;
      if (config.network.wifiPwd) this.network.wifiPwd = config.network.wifiPwd;
      if (config.network.mode) this.network.mode = config.network.mode;
    }
  }
}
