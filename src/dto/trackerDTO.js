export default class TrackerDTO {
  constructor(tracker) {
    this.id = tracker.id;
    this.petName = tracker.petName;
    this.model = tracker.model;
    this.image = tracker.image;
    this.state = tracker.state;
    this.frequency = tracker.frequency;
    this.lowBat = tracker.lowBat;
    this.geofenceLat = tracker.geofenceLat;
    this.geofenceLon = tracker.geofenceLon;
    this.geofenceRadius = tracker.geofenceRadius;
    this.enableGeofence = tracker.enableGeofence;
    this.enableSoundAlert = tracker.enableSoundAlert;
    this.emergencyFrequency = tracker.emergencyFrequency;
    this.active = tracker.active;
  }
}
