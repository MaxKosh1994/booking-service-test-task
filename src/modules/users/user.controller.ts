import type { Request, Response } from 'express';
import * as service from './user.service.js';

//? Получение списка всех пользователей
export async function list(req: Request, res: Response) {
  const users = await service.list();
  res.json({ data: users, error: null, message: 'OK', statusCode: 200 });
}

//? Получение пользователя по id
export async function get(req: Request, res: Response) {
  const user = await service.get(Number(req.params.id));
  res.json({ data: user, error: null, message: 'OK', statusCode: 200 });
}

//? Создание нового пользователя
export async function create(req: Request, res: Response) {
  const user = await service.create(req.body);
  res.status(201).json({ data: user, error: null, message: 'Created', statusCode: 201 });
}

//? Обновление пользователя по id
export async function update(req: Request, res: Response) {
  const user = await service.update(Number(req.params.id), req.body);
  res.json({ data: user, error: null, message: 'Updated', statusCode: 200 });
}

//? Удаление пользователя по id
export async function remove(req: Request, res: Response) {
  await service.remove(Number(req.params.id));
  res.status(204).json({ data: null, error: null, message: 'Deleted', statusCode: 204 });
}
