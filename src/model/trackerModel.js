export default class TrackerModel {
  #dao;
  constructor(dao) {
    this.#dao = dao;
  }

  async createTracker(tracker) {
    const exists = await this.#dao.findById(tracker.id);
    if (!exists) throw new Error('Tracker ya existe');
    return await this.#dao.create(tracker);
  }

  async findTrackerById(id) {
    return await this.#dao.findById(id);
  }

  async updateTracker(tracker) {
    const exists = await this.#dao.findById(tracker.id);
    if (!exists) throw new Error('Tracker no existe');
    return await this.#dao.update(tracker);
  }

  async deleteTracker(tracker) {
    const exists = await this.#dao.findById(tracker.id);
    if (!exists) throw new Error('Tracker no existe');
    return await this.#dao.delete(tracker.id);
  }

  async getAllTrackers() {
    const trackers = await this.#dao.getAll();
    return trackers;
  }
}
