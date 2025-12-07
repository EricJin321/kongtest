import ServiceWebApi from '../utils/servicewebapi';

describe('Basic API Tests', () => {
  it('HTTPS hello endpoint should return 200 with correct response', () => {
    ServiceWebApi.helloApi(true, 200, { msg: 'hello world' });
  });
});
