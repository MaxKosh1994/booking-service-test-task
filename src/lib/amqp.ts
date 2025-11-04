import AmqpClient from 'rabbitmq-client';
import { Buffer } from 'node:buffer';

const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

let client: any | null = null;

//? Получение AMQP соединения c делегированием методов к connection
export async function getAmqp(): Promise<{
  exchangeDeclare: (args: any) => Promise<any>;
  basicPublish: (args: any) => Promise<any>;
}> {
  if (!client) {
    const RMQ: any = AmqpClient as any;
    let instance: any | null = null;
    try {
      instance = new RMQ({ url });
    } catch {
      try {
        instance = new RMQ.AmqpClient({ url });
      } catch {
        instance = RMQ({ url });
      }
    }
    client = instance;

    if (client?.connect) {
      await client.connect();
    } else if (client?.connection?.connect) {
      await client.connection.connect();
    }
  }

  const connection: any = client.connection ?? client;
  return {
    exchangeDeclare: (args: any) => connection.exchangeDeclare(args),
    basicPublish: (args: any) => connection.basicPublish(args),
  };
}

//? Публикация события бронирования
export async function publishBookingCreated(payload: {
  id: number;
  eventId: number;
  userId: number;
}) {
  try {
    const c = await getAmqp();
    const exchange = 'booking';
    await c.exchangeDeclare({ exchange, type: 'topic', durable: true });
    await c.basicPublish({
      exchange,
      routingKey: 'booking.created',
      body: Buffer.from(JSON.stringify(payload)),
    });
  } catch {
    return;
  }
}

export default getAmqp;
