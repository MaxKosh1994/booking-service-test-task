const store = new Map<string, string>();

export const ensureRedisConnected = jest.fn().mockResolvedValue(undefined);

export const redis = {
  isOpen: true,
  connect: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockImplementation((key: string) => store.get(key) || null),
  set: jest.fn().mockImplementation((key: string, val: string) => {
    store.set(key, val);
    return 'OK';
  }),
  del: jest.fn().mockResolvedValue(1),
  sMembers: jest.fn().mockResolvedValue([]),
  sAdd: jest.fn().mockResolvedValue(1),
  sRem: jest.fn().mockResolvedValue(1),
  multi: jest.fn().mockReturnValue({
    del: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  }),
};

export default redis;

