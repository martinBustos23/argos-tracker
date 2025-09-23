import { describe } from 'mocha';
import { assert } from 'chai';
import { faker, fakerES } from '@faker-js/faker';

import UserDAO from '../../src/dao/userDAO.js';
import UserDTO from '../../src/dto/userDTO.js';

import { deepCompare, initDB, dropTables, compareArrays } from '../testUtils.js';

describe('Test de userDAO DRUD', () => {
  let db;
  let dao;
  let users = []; // array de seguimiento de usuarios

  // antes de iniciar test
  before(async () => {
    // inicializar la db
    db = await initDB();
    dao = new UserDAO(db);
    
    // crear n usuarios para test
    for (let index = 0; index < 10; index++) {
      // crea un objeto usuario con username, password y randomizar el resto de parametros
      const user = new UserDTO({
        username: faker.person.firstName(),
        password: faker.string.alphanumeric({ length: { min: 5, max: 10 } }),
        active: Math.random() >= 0.5 ? undefined : faker.datatype.boolean({ probability: 0.5 }),
        admin: Math.random() >= 0.5 ? undefined : faker.datatype.boolean({ probability: 0.5 }),
        lastLogin: Math.random() >= 0.5 ? undefined : faker.date.recent(),
        timeout: Math.random() >= 0.5 ? undefined : ( Math.random() >= 0.5 ? null : faker.date.recent({ days: 10 }))
      });

      // borrar los atributos que tengan valor indefinido
      for (const key in user) {
        if (user[key] === undefined) delete user[key];
      }
      
      // crear usuario en la base de datos
      users.push(await dao.create(user));
    }
  });

  // luego de finalizar los test dropear las tablas de la db de testing
  after(async () => {
    await dropTables(db);
  })

  // crea un objeto usuario con username, password y randomizar el resto de parametros
  const user = new UserDTO({
    username: faker.person.firstName(),
    password: faker.string.alphanumeric({ length: { min: 5, max: 10 } }),
    active: Math.random() >= 0.5 ? undefined : faker.datatype.boolean({ probability: 0.5 }),
    admin: Math.random() >= 0.5 ? undefined : faker.datatype.boolean({ probability: 0.5 }),
    lastLogin: Math.random() >= 0.5 ? undefined : faker.date.recent(),
    timeout: Math.random() >= 0.5 ? undefined : ( Math.random() >= 0.5 ? null : faker.date.recent({ days: 10 }))
  });

  // borrar los atributos que tengan valor indefinido
  for (const key in user) {
    if (user[key] === undefined) delete user[key];
  }

  it('deberia crear un usuario nuevo', async () => {
    const newUser = await dao.create(user);
    const expected = user;

    assert(newUser instanceof UserDTO);
    assert(deepCompare(newUser, expected));

    users.push(newUser); // agregar al array de seguimiento de usuarios
  });

  it('deberia encontrar un usuario existente', async () => {
    const existingUser = await dao.find(user.username);
    const expected = user;

    assert(existingUser instanceof UserDTO);
    assert(deepCompare(existingUser, expected));
  });

  it('deberia devolver null si el usuario no existe', async () => {
    const nonExistingUser = await dao.find(fakerES.person.firstName());
    assert(nonExistingUser === null);
  });

  it('deberia obtener la lista de todos los usuarios', async() => {
    const users = await dao.getAll();
    const expected = users;

    assert(users instanceof Array);
    assert(compareArrays(users, expected));
  });

  it('deberia actualizar usuarios', async() => {
    // objeto de actualizacion random
    const actualizacion = {
      password: Math.random() >= 0.5 ? undefined : faker.string.alphanumeric({ length: { min: 5, max: 10 } }),
      admin: Math.random() >= 0.5 ? undefined : faker.datatype.boolean(),
      active: Math.random() >= 0.5 ? undefined : faker.datatype.boolean(),
      lastLogin: Math.random() >= 0.5 ? undefined : faker.date.recent(),
      timeout: Math.random() >= 0.5 ? undefined : (Math.random() >= 0.5 ? null : faker.date.recent({ days: 10 })),
    };

    // borrar los atributos undefined porque solo se pasan los que se modifican
    for (const key in actualizacion) {
      if (actualizacion[key] === undefined) delete actualizacion[key];
    }
    
    const updatedUser = await dao.update(user.username, actualizacion);
    const expected = new UserDTO({
      username: user.username,
      password: actualizacion.password || user.password,
      admin: Object.hasOwn(actualizacion, 'admin') ? actualizacion.admin : user.admin,
      active: Object.hasOwn(actualizacion, 'active') ? actualizacion.active : user.active,
      lastLogin: Object.hasOwn(actualizacion, 'lastLogin') ? actualizacion.lastLogin : user.lastLogin,
      timeout: Object.hasOwn(actualizacion, 'timeout') ? actualizacion.timeout : user.timeout
    });

    assert(updatedUser instanceof UserDTO);
    assert(deepCompare(updatedUser, expected));

    const userIndex = users.findIndex(user => user.username === updatedUser.username);
    users[userIndex] = expected; // actualizar el usuario correspondiente en el array de seguimiento
  });

  it('deberia obtener una lista de todos los usuarios inactivos', async() => {
    let inactive = await dao.getAllInactive();
    let expected = users.filter(user => user.active === false );

    // deberiamos devolver los arrays de DTOs ordenados?
    inactive = inactive.toSorted((a, b) => a.username.localeCompare(b.username));
    expected = expected.toSorted((a, b) => a.username.localeCompare(b.username));

    assert(users instanceof Array);
    assert(compareArrays(inactive, expected));
  });

  it('deberia borrar un usuario existente', async () => {
    const userToDelete = users[Math.floor(Math.random() * users.length)];
    const deletedUser = await dao.delete(userToDelete.username);
    const allUsers = await dao.getAll();

    assert(deletedUser instanceof UserDTO);
    assert(deepCompare(userToDelete, deletedUser));
    // revisar que se haya borrado el usuario
    assert(allUsers.findIndex(user => user.username === deletedUser.username) === -1);
  });
});

