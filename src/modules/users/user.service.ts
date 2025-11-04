import { User } from '../../../db/models/index.js';
import createHttpError from 'http-errors';

const ATTRIBUTES = ['id', 'email', 'name', 'role', 'createdAt'];

enum USER_ROLES {
  USER = 'user',
  ADMIN = 'admin',
}

export async function list() {
  return User.findAll({ attributes: ATTRIBUTES });
}

export async function get(id: number) {
  const user = await User.findByPk(id, {
    attributes: ATTRIBUTES,
  });
  if (!user) throw createHttpError(404, 'User not found');
  return user;
}

export async function create(data: {
  email: string;
  password: string;
  name?: string;
  role?: USER_ROLES;
}) {
  if (!data.email || !data.password) throw createHttpError(400, 'email and password required');
  const exists = await User.findOne({ where: { email: data.email } });
  if (exists) throw createHttpError(409, 'User already exists');
  const user = await (User as any).create({
    email: data.email,
    password: data.password,
    name: data.name || null,
    role: data.role || USER_ROLES.USER,
  });
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function update(id: number, data: Partial<{ name: string; role: USER_ROLES }>) {
  const user = await User.findByPk(id);
  if (!user) throw createHttpError(404, 'User not found');
  await user.update({ name: data.name ?? user.name, role: data.role ?? user.role });
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function remove(id: number) {
  const user = await User.findByPk(id);
  if (!user) throw createHttpError(404, 'User not found');
  await user.destroy();
}
