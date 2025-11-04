import { Event, Booking } from '../../../db/models/index.js';
import createHttpError from 'http-errors';

export async function list() {
  return Event.findAll({ order: [['id', 'ASC']] });
}

export async function get(id: number) {
  const event = await Event.findByPk(id, {
    include: [{ model: Booking, as: 'bookings', required: false }] as any,
  });
  if (!event) throw createHttpError(404, 'Event not found');
  return event;
}

export async function create(data: { name: string; totalSeats: number }) {
  if (typeof data.totalSeats !== 'number' || data.totalSeats < 0)
    throw createHttpError(400, 'Invalid totalSeats');
  const event = await Event.create({ name: data.name, totalSeats: data.totalSeats });
  return event;
}

export async function update(id: number, data: Partial<{ name: string; totalSeats: number }>) {
  const event = await Event.findByPk(id);
  if (!event) throw createHttpError(404, 'Event not found');
  await event.update({
    name: data.name ?? event.name,
    totalSeats: data.totalSeats ?? event.totalSeats,
  });
  return event;
}

export async function remove(id: number) {
  const event = await Event.findByPk(id);
  if (!event) throw createHttpError(404, 'Event not found');
  await event.destroy();
}
