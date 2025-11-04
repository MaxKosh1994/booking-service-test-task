import type { Request, Response } from 'express';
import * as service from './event.service.js';

export async function list(req: Request, res: Response) {
  const events = await service.list();
  res.json({ data: events, error: null, message: 'OK', statusCode: 200 });
}

export async function get(req: Request, res: Response) {
  const event = await service.get(Number(req.params.id));
  res.json({ data: event, error: null, message: 'OK', statusCode: 200 });
}

export async function create(req: Request, res: Response) {
  const event = await service.create(req.body);
  res.status(201).json({ data: event, error: null, message: 'Created', statusCode: 201 });
}

export async function update(req: Request, res: Response) {
  const event = await service.update(Number(req.params.id), req.body);
  res.json({ data: event, error: null, message: 'Updated', statusCode: 200 });
}

export async function remove(req: Request, res: Response) {
  await service.remove(Number(req.params.id));
  res.status(204).json({ data: null, error: null, message: 'Deleted', statusCode: 204 });
}
