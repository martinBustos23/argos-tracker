export default class TrackerDTO {
  constructor(tracker) {
    this.id = tracker.id;
    this.petName = tracker.petName;
    this.frequency = tracker.frequency;
    this.lowBat = tracker.lowBat;
    this.safeZoneLat = tracker.safeZoneLat;
    this.safeZoneLon = tracker.safeZoneLon;
    this.safeZoneRadius = tracker.safeZoneRadius;
    this.active = tracker.active;
  }
}
