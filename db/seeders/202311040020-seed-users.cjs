'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@example.com',
        password_hash: passwordHash,
        name: 'Admin',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'user1@example.com',
        password_hash: await bcrypt.hash('user1234', 10),
        name: 'User 1',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: ['admin@example.com', 'user1@example.com'] });
  },
};
