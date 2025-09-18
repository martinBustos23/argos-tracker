export default class TrackerEventDTO {
  constructor(event) {
    this.id = event.id;
    this.timestamp = new Date(event.timestamp + 'UTC');
    this.trackerId = event.trackerId;
    this.eventDesc = event.eventDesc;
    this.latitude = event.latitude;
    this.longitude = event.longitude;
    this.batteryLvl = event.batteryLvl;
  }
}
