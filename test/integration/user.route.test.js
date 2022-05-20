process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb';

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');
require('dotenv').config();
const DBConnection = require('../../database/DBConnection');
const jwt = require('jsonwebtoken');
const { expect } = require('chai');

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `isActive` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "12345678A", "street", "city", 0),' +
    '(2, "uniquename", "fasfasfas", "second@server.nl", "12345678A", "street", "city", 1);';

const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe('Manage users /api/user', () => {
    beforeEach((done) => {
        DBConnection.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query(
                CLEAR_DB + INSERT_USER,
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    done();
                }
            );
        });
    });

    describe('UC-201 add user /api/user', () => {

        it('TC-201-1 should return a valid error when required input is missing', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    password: '12345678A',
                    isActive: true,
                    phoneNumber: '12345678',
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;
                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('emailAdress is a required field');

                    done();
                });
        });

        it('TC-201-2 should return a valid error when email address is invalid', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    emailAdress: 'invalidemail',
                    password: '12345678A',
                    isActive: true,
                    phoneNumber: '12345678',
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;
                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('emailAdress must be a valid email');

                    done();
                });
        });

        it('TC-201-3 should return a valid error when password is invalid', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    emailAdress: 'invalidemail',
                    password: '&*%_$@',
                    isActive: true,
                    phoneNumber: '12345678',
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;
                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('password must be a valid password');

                    done();
                });
        });

        it('TC-201-4 should return a valid status and message when a user is already registered', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'Server',
                    lastName: 'server',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    emailAdress: 'name@server.nl',
                    password: '12345678A',
                    isActive: true,
                    phoneNumber: '12345678',
                })
                .end((err, res) => {
                    res.should.have.status(409);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;

                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('User is already registered');

                    done();
                });
        });

        it('TC-201-5 should return a valid status and response with user after registering the user', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    emailAdress: 'rick@gmail.com',
                    password: '12345678A',
                    isActive: true,
                    phoneNumber: '12345678',
                })
                .end((err, res) => {
                    res.should.have.status(201);
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
                            'street',
                            'city',
                            'id',
                            'emailAdress',
                            'isActive',
                            'phoneNumber'
                        );

                    done();
                });
        });
    });

    describe('UC-202 Overview of users /api/user', () => {
        describe('without users', () => {
            beforeEach((done) => {
                DBConnection.getConnection(function (err, connection) {
                    if (err) throw err;

                    connection.query(
                        CLEAR_DB,
                        function (error, results, fields) {
                            connection.release();

                            if (error) throw error;

                            done();
                        }
                    );
                });
            });

            it('TC-202-1 should return an empty array when no users are registered', (done) => {
                chai.request(server)
                    .get('/api/user')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                    )
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.an('object');

                        res.body.should.be
                            .an('object')
                            .that.has.keys('statusCode', 'result');

                        const { result } = res.body;

                        result.should.be.an('array').that.is.empty;

                        done();
                    });
            });
        });

        it('TC-202-2 should return an array of users when two users are registered', (done) => {
            chai.request(server)
                .get('/api/user')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'result');

                    const { result } = res.body;

                    result.should.be.an('array').that.has.lengthOf(2);

                    result[0].should.be
                        .an('object')
                        .that.has.all.keys(
                            'firstName',
                            'lastName',
                            'password',
                            'street',
                            'city',
                            'id',
                            'emailAdress',
                            'isActive',
                            'roles',
                            'phoneNumber'
                        );

                    result[1].should.be
                        .an('object')
                        .that.has.all.keys(
                            'firstName',
                            'lastName',
                            'password',
                            'street',
                            'city',
                            'id',
                            'emailAdress',
                            'isActive',
                            'roles',
                            'phoneNumber'
                        );

                    done();
                });
        });

        it('TC-202-3 should return an empty array when filtered name does not exist', (done) => {
            chai.request(server)
                .get('/api/user/?name=somerandomname')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'result');

                    const { result } = res.body;

                    result.should.be.an('array').that.is.empty;

                    done();
                });
        });

        it('TC-202-4 should return an array of inactive users when filtered on isActive=0', (done) => {
            chai.request(server)
                .get('/api/user/?isActive=0')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'result');

                    const { result } = res.body;

                    result.should.be.an('array').that.has.lengthOf(1);

                    result[0].should.be
                        .an('object')
                        .that.has.all.keys(
                            'firstName',
                            'lastName',
                            'password',
                            'street',
                            'city',
                            'id',
                            'emailAdress',
                            'isActive',
                            'roles',
                            'phoneNumber'
                        );

                    expect(result.map((user) => user.isActive)).to.include(0);

                    done();
                });
        });

        it('TC-202-5 should return an array of active users when filtered on isActive=1', (done) => {
            chai.request(server)
                .get('/api/user/?isActive=1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'result');

                    const { result } = res.body;

                    result.should.be.an('array').that.has.lengthOf(1);

                    result[0].should.be
                        .an('object')
                        .that.has.all.keys(
                            'firstName',
                            'lastName',
                            'password',
                            'street',
                            'city',
                            'id',
                            'emailAdress',
                            'isActive',
                            'roles',
                            'phoneNumber'
                        );

                    expect(result.map((user) => user.isActive)).to.include(1);

                    done();
                });
        });

        it('TC-202-6 should return correct users with the searchterm in their name', (done) => {
            chai.request(server)
                .get('/api/user/?name=uniquename')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'result');

                    const { result } = res.body;

                    result.should.be.an('array').that.has.lengthOf(1);

                    result[0].should.be
                        .an('object')
                        .that.has.all.keys(
                            'firstName',
                            'lastName',
                            'password',
                            'street',
                            'city',
                            'id',
                            'emailAdress',
                            'isActive',
                            'roles',
                            'phoneNumber'
                        );

                    result[0].firstName.should.contain('uniquename');

                    done();
                });
        });
    });

    describe('UC-203 request user profile /api/user/profile', () => {
        it('TC-203-1 should return a valid statusCode with error message when there is an invalid token', (done) => {
            chai.request(server)
                .get('/api/user/profile')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, 'somerandomkey')
                )
                .end((err, res) => {
                    res.should.have.status(401);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;

                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('Unauthorized');

                    done();
                });
        });

        it('TC-203-2 should return a valid statusCode with user when token is valid and user exists', (done) => {
            chai.request(server)
                .get('/api/user/profile')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'result');

                    const { statusCode, result } = res.body;

                    statusCode.should.be.an('number');
                    result.should.be
                        .an('object')
                        .that.has.all.keys(
                            'firstName',
                            'lastName',
                            'password',
                            'street',
                            'city',
                            'id',
                            'emailAdress',
                            'isActive',
                            'roles',
                            'phoneNumber'
                        );

                    done();
                });
        });
    });

    describe('UC-204 request user details /api/user/:id', () => {
        it('TC-204-1 should return a valid statusCode with error message when there is an invalid token', (done) => {
            chai.request(server)
                .get('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, 'somerandomkey')
                )
                .end((err, res) => {
                    res.should.have.status(401);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;

                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('Unauthorized');

                    done();
                });
        });

        it('TC-204-2 should return a valid statusCode with error message when user does not exist', (done) => {
            chai.request(server)
                .get('/api/user/9999999')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(404);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;

                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('User is not registered.');

                    done();
                });
        });

        it('TC-204-3 should return a valid statusCode with user when user is retrieved', (done) => {
            chai.request(server)
                .get('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'result');

                    const { statusCode, result } = res.body;

                    statusCode.should.be.an('number');
                    result.should.be
                        .an('object')
                        .that.has.all.keys(
                            'firstName',
                            'lastName',
                            'password',
                            'street',
                            'city',
                            'id',
                            'emailAdress',
                            'isActive',
                            'roles',
                            'phoneNumber'
                        );

                    done();
                });
        });
    });

    describe('UC-205 update user /api/user', () => {

        it('TC-205-1 should return a valid error when required input is missing', (done) => {
            chai.request(server)
                .put('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    password: '12345678A',
                    isActive: true,
                    phoneNumber: '12345678',
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;
                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('emailAdress is a required field');

                    done();
                });
        });

        it('TC-205-4 should return a valid statuscode and error message when user does not exist', (done) => {
            chai.request(server)
                .put('/api/user/999')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 999 }, process.env.JWT_SECRET)
                )
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    emailAdress: 'test@gmail.com',
                    password: '12345678A',
                    isActive: true,
                    phoneNumber: '12345678',
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;
                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('User is not registered.');

                    done();
                });
        });

        it('TC-205-5 should return a valid statuscode and error message when user is not signed in', (done) => {
            chai.request(server)
                .put('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 2 }, process.env.JWT_SECRET)
                )
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    emailAdress: 'test@gmail.com',
                    password: '12345678A',
                    isActive: true,
                    phoneNumber: '12345678',
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(401);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;
                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('Unauthorized');

                    done();
                });
        });

        it('TC-205-6 should return a valid statusCode and user when succesfully registered', (done) => {
            chai.request(server)
                .put('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    emailAdress: 'update@gmail.com',
                    password: '12345678A',
                    isActive: true,
                    phoneNumber: '12345678',
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'result');

                    const { statusCode, result } = res.body;
                    statusCode.should.be.an('number');

                    result.should.be
                        .an('object')
                        .that.has.all.keys(
                            'firstName',
                            'lastName',
                            'password',
                            'street',
                            'city',
                            'id',
                            'emailAdress',
                            'isActive',
                            'phoneNumber'
                        );

                    done();
                });
        });
    });

    describe('UC-206 delete user /api/user', () => {

        it('TC-206-1 should return a valid statusCode with error message when user does not exist', (done) => {
            chai.request(server)
                .delete('/api/user/999')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 999 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(400);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;

                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('User does not exist');

                    done();
                });
        });

        it('TC-206-2 should return a valid statusCode with error message when user is nog signed in', (done) => {
            chai.request(server)
                .delete('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 2 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(401);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;

                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('Unauthorized');

                    done();
                });
        });

        it('TC-206-4 should return a valid statusCode with succes message when user is deleted', (done) => {
            chai.request(server)
                .delete('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'message');

                    const { statusCode, message } = res.body;

                    statusCode.should.be.an('number');
                    message.should.be
                        .an('string')
                        .that.contains('User deleted');

                    done();
                });
        });
    });
});
