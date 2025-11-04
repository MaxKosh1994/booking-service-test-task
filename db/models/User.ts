import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize.js';
import bcrypt from 'bcrypt';

export interface UserAttributes {
  id: number;
  email: string;
  passwordHash: string;
  name: string | null;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreation = Optional<UserAttributes, 'id' | 'name' | 'role' | 'passwordHash'> & {
  password?: string;
};

export class User extends Model<UserAttributes, UserCreation> implements UserAttributes {
  public id!: number;
  public email!: string;
  public passwordHash!: string;
  public name!: string | null;
  public role!: 'user' | 'admin';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
    name: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
  },
  { sequelize, modelName: 'User', tableName: 'users', underscored: true },
);

User.beforeCreate(async (user: any) => {
  if (user.password) {
    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(user.password, saltRounds);
  }
});

export default User;
