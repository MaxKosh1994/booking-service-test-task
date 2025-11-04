import User from './User.js';
import Event from './Event.js';
import Booking from './Booking.js';

//? Связь между пользователем и событием через бронирование
User.belongsToMany(Event, {
  through: Booking,
  foreignKey: 'userId',
  otherKey: 'eventId',
  as: 'bookedEvents',
});

//? Связь между событием и пользователем через бронирование
Event.belongsToMany(User, {
  through: Booking,
  foreignKey: 'eventId',
  otherKey: 'userId',
  as: 'attendees',
});

//? Связь между бронированием и пользователем
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
//? Связь между бронированием и событием
Booking.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

export { User, Event, Booking };
