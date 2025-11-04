import type { Request, Response } from 'express';
import * as service from './booking.service.js';
import { withIdempotency } from '../../lib/idempotency.js';
import { publishBookingCreated } from '../../lib/amqp.js';

export async function list(req: Request, res: Response) {
  const items = await service.list();
  res.json({ data: items, error: null, message: 'OK', statusCode: 200 });
}

export async function get(req: Request, res: Response) {
  const item = await service.get(Number(req.params.id));
  res.json({ data: item, error: null, message: 'OK', statusCode: 200 });
}

export async function create(req: Request, res: Response) {
  const item = await service.create({
    eventId: Number(req.body.event_id || req.body.eventId),
    userId: Number(req.body.user_id || req.body.userId),
  });
  res.status(201).json({ data: item, error: null, message: 'Created', statusCode: 201 });
}

export async function remove(req: Request, res: Response) {
  await service.remove(Number(req.params.id));
  res.status(204).json({ data: null, error: null, message: 'Deleted', statusCode: 204 });
}

export async function reserve(req: Request, res: Response) {
  const eventId = Number(req.body?.event_id ?? req.body?.eventId);
  if (!eventId || !req.auth?.userId) {
    return res
      .status(400)
      .json({ data: null, error: 'BAD_REQUEST', message: 'event_id required', statusCode: 400 });
  }
  const key = String(req.headers['idempotency-key'] || `${req.auth.userId}:${eventId}`);
  const result = await withIdempotency(key, async () => {
    const booking = await service.create({ eventId, userId: Number(req.auth!.userId) });
    await publishBookingCreated({
      id: booking.id,
      eventId: booking.eventId,
      userId: booking.userId,
    });
    return { id: booking.id };
  });
  res.status(result.reused ? 200 : 201).json({
    data: result.value,
    error: null,
    message: result.reused ? 'OK' : 'Created',
    statusCode: result.reused ? 200 : 201,
  });
}

export async function exportCSV(req: Request, res: Response) {
  await service.exportBookingsToCSV(res);
}
