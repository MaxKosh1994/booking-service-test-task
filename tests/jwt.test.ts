import { signAccessToken, signRefreshToken, verifyAccess, verifyRefresh } from '../src/lib/jwt.js';

jest.mock('../src/lib/env.ts');

enum USER_ROLES {
  USER = 'user',
  ADMIN = 'admin',
}

//? Тесты для JWT утилит
describe('JWT утилиты', () => {
  it('подписывает и проверяет access-токен', () => {
    const { token } = signAccessToken('123', USER_ROLES.USER);
    expect(token).toBeTruthy();
    const payload = verifyAccess(token);
    expect(payload.sub).toBe('123');
    expect(payload.role).toBe(USER_ROLES.USER);
  });

  it('подписывает и проверяет refresh-токен', () => {
    const { token } = signRefreshToken('456');
    expect(token).toBeTruthy();
    const payload = verifyRefresh(token);
    expect(payload.sub).toBe('456');
  });
});
