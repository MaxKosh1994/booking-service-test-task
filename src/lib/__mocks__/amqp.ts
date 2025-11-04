export const getAmqp = jest.fn().mockResolvedValue({
  exchangeDeclare: jest.fn().mockResolvedValue(undefined),
  basicPublish: jest.fn().mockResolvedValue(undefined),
});

export const publishBookingCreated = jest.fn().mockResolvedValue(undefined);

export default getAmqp;
