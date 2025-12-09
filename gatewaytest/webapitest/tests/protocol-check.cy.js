import ServiceWebApi from '../utils/servicewebapi';

describe('HTTP/HTTPS Protocol Check', () => {
  const basicRoutePath = '/testbasic';
  it('HTTP should return 426', () => {
    ServiceWebApi.getHelloApi(basicRoutePath, false, 426, undefined);
  });

  it('HTTPS should return 200 with correct response', () => {
    ServiceWebApi.getHelloApi(basicRoutePath, true, 200, { msg: 'hello world' });
  });
});
