'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('events', [
      { name: 'NodeConf', total_seats: 100, created_at: new Date(), updated_at: new Date() },
      { name: 'JS Summit', total_seats: 50, created_at: new Date(), updated_at: new Date() },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('events', { name: ['NodeConf', 'JS Summit'] });
  },
};


