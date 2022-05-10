const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');

let database = [];

chai.should();
chai.use(chaiHttp);

describe('Manage users /api/user', () => {
    describe('UC-201 add user /api/user', () => {
        beforeEach((done) => {
            database = [];
            done();
        });

        it('TC-201-1 should return a valid error when required input is missing', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    password: 'secret',
                    emailAdress: 'j.doe@server.com',
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'result');

                    const { statusCode, result } = res.body;
                    statusCode.should.be.an('number');
                    result.should.be
                        .an('string')
                        .that.contains('emailAddress is a required field');

                    done();
                });
        });

        it('TC-201-2 should return a valid error when email address is invalid', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    emailAddress: 'invalidemail',
                    password: '123',
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'result');

                    const { statusCode, result } = res.body;
                    statusCode.should.be.an('number');
                    result.should.be
                        .an('string')
                        .that.contains('emailAddress must be a valid email');

                    done();
                });
        });

        it('TC-201-3 should return a valid error when password is invalid', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    password: '123_$_',
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'result');

                    const { statusCode, result } = res.body;
                    statusCode.should.be.an('number');
                    result.should.be
                        .an('string')
                        .that.contains('password must be a valid password');

                    done();
                });
        });

        it('TC-201-5 should return a valid status and response with user after registering the user', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    emailAddress: 'john@gmail.com',
                    password: '12345',
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'result');

                    const { result } = res.body;

                    result.should.be
                        .an('object')
                        .that.has.all.keys(
                            'firstName',
                            'lastName',
                            'password',
                            'id',
                            'emailAddress'
                        );

                    done();
                });
        });
    });
});
