export const LEVEL = Object.freeze({
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
});

export const USER_ACTIONS = Object.freeze({
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  BLOCK: 'BLOCK',
  DISABLED: 'DISABLED',
  DELETE: 'DELETE',
});

export const TRACKER_ACTIONS = Object.freeze({
  LINK: 'LINK',
  UNLINK: 'UNLINK',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DISABLED: 'DISABLED',
  DELETE: 'DELETE',
});

export const SYSTEM_ACTIONS = Object.freeze({
  CREATE: 'CREATE',
  CONNECT: 'CONNECT',
  UPDATE_CONFIG: 'UPDATE_CONFIG'
});

export const USER_TRIES = Object.freeze({
  BLOCK_TRIES: 9,
  FIRST_TIMEOUT_TRIES: 3,
  FIRST_TIMEOUT_MINUTES: 0,
  SECOND_TIMEOUT_TRIES: 6,
  SECOND_TIMEOUT_MINUTES: 0,
});

export const PET_ICONS = Object.freeze([
  'perro1',
  'perro2',
  'perro3',
  'perro4',
  'gato1',
  'gato2',
  'gato3',
  'gato4',
]);

export const USER_ICONS = Object.freeze(['user1', 'user2', 'user3', 'user4']);

export const MODEL_TRACKER = Object.freeze(['mod-LoRa', 'mod-GSM', 'mod-LoRa/GSM']);
