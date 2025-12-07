import ServiceWebApi from '../utils/servicewebapi';

describe('HTTP/HTTPS Protocol Check', () => {
  it('HTTP should return 426', () => {
    ServiceWebApi.helloApi(false, 426);
  });

  it('HTTPS should return 200 with correct response', () => {
    ServiceWebApi.helloApi(true, 200, { msg: 'hello world' });
  });
});
