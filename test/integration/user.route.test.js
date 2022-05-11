process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb';

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');
require('dotenv').config();
const DBConnection = require('../../database/DBConnection');

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city"),' +
    '(2, "first", "last", "second@server.nl", "secret", "street", "city");';

const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe('Manage users /api/user', () => {
    describe('UC-201 add user /api/user', () => {
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

        it('TC-201-1 should return a valid error when required input is missing', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    password: 'secret',
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
                    password: 'secret',
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
                    password: '123',
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
                    password: '123',
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

    describe('UC-202 Overview of users', () => {
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

        it.only('TC-202-1 should return an empty array when no users are registered', () => {
            chai.request(server)
                .get('/api/user')
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
});
