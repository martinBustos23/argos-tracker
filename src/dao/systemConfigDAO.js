import SystemConfigDTO from '../dto/systemConfigDTO.js';
import fs from 'fs/promises';
import path from 'path';
import { __dirname, updateObjectValues } from '../utils.js';

export default class SystemConfigDAO {
  #db;
  constructor(db) {
    this.#db = db;
  }

  async get() {
    const systemConfigString = await fs.readFile(
      path.join(__dirname, './config/systemConfig.json'),
      { encoding: 'utf-8' }
    );
    return JSON.parse(systemConfigString);
  }

  async update(configMods) {
    const systemConfig = await this.get();
    updateObjectValues(systemConfig, configMods);
    await fs.writeFile(
      path.join(__dirname, './config/systemConfig.json'),
      JSON.stringify(systemConfig, null, 2)
    );
    return await this.get();
  }
}
