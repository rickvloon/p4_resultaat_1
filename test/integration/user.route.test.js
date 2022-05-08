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
                    lastName: 'Doe'
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.be.an('object');
                    const { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be.a('string').that.equals('Email must be a string');
                    done();
                });
        });
    });
});