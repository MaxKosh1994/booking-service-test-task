import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize.js';

export interface BookingAttributes {
  id: number;
  eventId: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type BookingCreation = Optional<BookingAttributes, 'id'>;

export class Booking
  extends Model<BookingAttributes, BookingCreation>
  implements BookingAttributes
{
  public id!: number;
  public eventId!: number;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Booking.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    eventId: { type: DataTypes.INTEGER, allowNull: false, field: 'event_id' },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    underscored: true,
    indexes: [
      { unique: true, fields: ['event_id', 'user_id'] },
      { fields: ['event_id'] },
      { fields: ['user_id'] },
    ],
  },
);

export default Booking;
