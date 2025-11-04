import { Booking, Event, User } from '../../../db/models/index.js';
import { format } from '@fast-csv/format';
import type { Response } from 'express';

//? Список бронирований
export async function list() {
  return await Booking.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'email'] },
      { model: Event, as: 'event', attributes: ['id', 'name'] },
    ],
  });
}

//? Получение одного бронирования
export async function get(id: number) {
  return await Booking.findByPk(id, {
    include: [
      { model: User, as: 'user' },
      { model: Event, as: 'event' },
    ],
  });
}

//? Создание бронирования
export async function create(data: { eventId: number; userId: number }) {
  return await Booking.create(data);
}

//? Удаление бронирования
export async function remove(id: number) {
  const booking = await Booking.findByPk(id);
  if (booking) await booking.destroy();
}

//? Экспорт бронирований в CSV
export async function exportBookingsToCSV(res: Response) {
  const bookings = await Booking.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'email', 'name'] },
      { model: Event, as: 'event', attributes: ['id', 'name', 'totalSeats'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  const csvStream = format({ headers: true });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=bookings-export.csv');

  csvStream.pipe(res);

  for (const booking of bookings) {
    const row = {
      booking_id: booking.id,
      user_id: booking.userId,
      user_email: (booking as any).user?.email || 'N/A',
      user_name: (booking as any).user?.name || 'N/A',
      event_id: booking.eventId,
      event_name: (booking as any).event?.name || 'N/A',
      created_at: booking.createdAt?.toISOString() || '',
    };
    csvStream.write(row);
  }

  csvStream.end();
}
