export default class TrackerEventDTO {
  constructor(event) {
    if (event.id) this.id = event.id;
    if (event.timestamp) this.timestamp = new Date(event.timestamp + 'UTC');
    if (event.trackerId) this.trackerId = event.trackerId;
    if (event.eventDesc) this.eventDesc = event.eventDesc;
    if (event.latitude) this.latitude = event.latitude;
    if (event.longitude) this.longitude = event.longitude;
    if (event.batteryLvl) this.batteryLvl = event.batteryLvl;
  }
}
