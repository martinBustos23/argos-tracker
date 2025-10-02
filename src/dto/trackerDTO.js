export default class TrackerDTO {
  constructor(tracker) {
    if (tracker.id) this.id = tracker.id;
    if (tracker.petName) this.petName = tracker.petName;
    if (tracker.model) this.model = tracker.model;
    if (tracker.image) this.image = tracker.image;
    if (tracker.state) this.state = tracker.state;
    if (tracker.frequency) this.frequency = tracker.frequency;
    if (tracker.lowBat) this.lowBat = tracker.lowBat;
    if (tracker.geofenceLat) this.geofenceLat = tracker.geofenceLat;
    if (tracker.geofenceLon) this.geofenceLon = tracker.geofenceLon;
    if (tracker.geofenceRadius) this.geofenceRadius = tracker.geofenceRadius;
    if (tracker.enableGeofence) this.enableGeofence = tracker.enableGeofence;
    if (tracker.enableSoundAlert) this.enableSoundAlert = tracker.enableSoundAlert;
    if (tracker.emergencyFrequency) this.emergencyFrequency = tracker.emergencyFrequency;
    if (tracker.active) this.active = tracker.active;
  }
}
