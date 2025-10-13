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
    if (tracker.enableGeofence || tracker.enableGeofence === false)
      this.enableGeofence = tracker.enableGeofence == true ? true : false;
    if (tracker.enableSoundAlert || tracker.enableSoundAlert === false)
      this.enableSoundAlert = tracker.enableSoundAlert == true ? true : false;
    if (tracker.emergencyFrequency) this.emergencyFrequency = tracker.emergencyFrequency;
    if (tracker.active || tracker.active === false)
      this.active = tracker.active == true ? true : false;
  }
}
