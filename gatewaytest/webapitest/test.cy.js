describe('HTTP/HTTPS status check', () => {

  it('HTTP should return 426', () => {
    cy.request({
      url: 'http://localhost:8000/testone/hello',
      failOnStatusCode: false // 不抛异常，允许非200状态码
    }).then((response) => {
      expect(response.status).to.eq(426);
    });
  });

  it('HTTPS should return 200 and JSON result', () => {
    cy.request({
      url: 'https://localhost:8443/testone/hello',
      method: 'GET',
      // 如果是自签名证书，忽略 TLS 验证
      rejectUnauthorized: false
    }).then((response) => {
      expect(response.status).to.eq(200);
      // 验证返回是 JSON 对象（可以根据实际字段修改）
      expect(response.body).to.deep.equal({ msg: 'hello world' });
    });
  });

});
