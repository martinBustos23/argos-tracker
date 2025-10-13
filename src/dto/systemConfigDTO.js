export default class SystemConfig {
  constructor(config) {
    if (config.general) {
      this.general = {};
      if (config.general.language) this.general.language = config.general.language;
      if (config.general.timezone) this.general.timezone = config.general.timezone;
      if (config.general['12/24hs']) this.general['12/24hs'] = config.general['12/24hs'];
    }
    if (config.devices) {
      this.devices = {};
      if (config.devices.showDisabled || config.devices.showDisabled === false)
        this.devices.showDisabled = config.devices.showDisabled;
    }
    if (config.location) {
      this.location = {};
      if (config.location.zone) this.location.zone = config.location.zone;
      if (config.location.zoom) this.location.zoom = config.location.zoom;
    }
    if (config.network) {
      this.network = {};
      if (config.network['wifi-client__ssid'])
        this.network['wifi-client__ssid'] = config.network['wifi-client__ssid'];
      if (config.network['wifi-client__pwd'])
        this.network['wifi-client__pwd'] = config.network['wifi-client__pwd'];
      if (config.network.mode) this.network.mode = config.network.mode;
      if (config.network['wifi-ap__ssid'])
        this.network['wifi-ap__ssid'] = config.network['wifi-ap__ssid'];
      if (config.network['wifi-ap__pwd'])
        this.network['wifi-ap__pwd'] = config.network['wifi-ap__pwd'];
    }
  }
}
