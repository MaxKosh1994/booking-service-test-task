import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize.js';

export interface EventAttributes {
  id: number;
  name: string;
  totalSeats: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type EventCreation = Optional<EventAttributes, 'id'>;

export class Event extends Model<EventAttributes, EventCreation> implements EventAttributes {
  public id!: number;
  public name!: string;
  public totalSeats!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Event.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    totalSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
      field: 'total_seats',
    },
  },
  { sequelize, modelName: 'Event', tableName: 'events', underscored: true },
);

export default Event;
