import { parsePm2LogOptions } from '../../src/routes/admin/pm2';

test('validates PM2 log stream options', () => {
  expect(parsePm2LogOptions('4', undefined)).toEqual({ processId: 4, lines: 100 });
  expect(parsePm2LogOptions('4', '500')).toEqual({ processId: 4, lines: 500 });

  expect(() => parsePm2LogOptions('-1', '100')).toThrow('Invalid PM2 process ID');
  expect(() => parsePm2LogOptions('4;shutdown', '100')).toThrow('Invalid PM2 process ID');
  expect(() => parsePm2LogOptions('4', '501')).toThrow('Lines must be between 0 and 500');
  expect(() => parsePm2LogOptions('4', ['100'])).toThrow('Lines must be between 0 and 500');
});
