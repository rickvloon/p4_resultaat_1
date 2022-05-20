process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb';

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');
require('dotenv').config();
const DBConnection = require('../../database/DBConnection');
const jwt = require('jsonwebtoken');

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "$2a$10$NLEkwpCNTsFFZVRjqPdB4uWB.f7/YsFgHs95PcFjDqz0bjy/mRE5a", "street", "city"),' +
    '(2, "first", "last", "second@server.nl", "12345678A", "street", "city");';

const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe('Manage meals /api/meal/', () => {
    beforeEach((done) => {
        DBConnection.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query(
                CLEAR_DB + INSERT_USER + INSERT_MEALS,
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    done();
                }
            );
        });
    });

    describe('UC-301 Create meal /api/meal', () => {
        it('TC-301-1 should return a valid error when required input is missing', (done) => {
            chai.request(server)
                .post('/api/meal')
                .send({
                    description: 'Dé pastaklassieker bij uitstek.',
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: '2022-05-20T08:30:53.232Z',
                    imageUrl:
                        'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                    allergenes: ['gluten', 'noten', 'lactose'],
                    maxAmountOfParticipants: 6,
                    price: 6.75,
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
                        .that.contains('name is a required field');

                    done();
                });
        });

        it('TC-301-2 should return a valid status code and error message when user is not logged in', (done) => {
            chai.request(server)
                .post('/api/meal')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, 'somerandomkey')
                )
                .send({
                    name: 'Spaghetti met bolognese',
                    description: 'Dé pastaklassieker bij uitstek.',
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: '2022-05-20T08:30:53.232Z',
                    imageUrl:
                        'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                    allergenes: ['gluten', 'noten', 'lactose'],
                    maxAmountOfParticipants: 6,
                    price: 6.75,
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

        it('TC-301-3 should return a succes status code and meal object when meal is succesfully added', (done) => {
            chai.request(server)
                .post('/api/meal')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET)
                )
                .send({
                    name: 'Spaghetti met bolognese',
                    description: 'Dé pastaklassieker bij uitstek.',
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: '2022-05-20T08:30:53.232Z',
                    imageUrl:
                        'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                    allergenes: ['gluten', 'noten', 'lactose'],
                    maxAmountOfParticipants: 6,
                    price: 6.75,
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'result');

                    const { result } = res.body;

                    result.should.be
                        .an('object')
                        .that.has.all.keys(
                            'id',
                            'name',
                            'description',
                            'isActive',
                            'isVega',
                            'isVegan',
                            'isToTakeHome',
                            'dateTime',
                            'imageUrl',
                            'allergenes',
                            'maxAmountOfParticipants',
                            'price'
                        );

                    done();
                });
        });
    });

    describe('UC-303 GET all users /api/meal', () => {
        it('TC-301-1 Should return a valid status code and list of 0 or more meals', (done) => {
            chai.request(server)
                .get('/api/meal')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');

                    res.body.should.be
                        .an('object')
                        .that.has.keys('statusCode', 'result');

                    const { result } = res.body;

                    result[0].should.be
                        .an('object')
                        .that.has.all.keys(
                            'id',
                            'name',
                            'description',
                            'isActive',
                            'isVega',
                            'isVegan',
                            'isToTakeHome',
                            'dateTime',
                            'imageUrl',
                            'allergenes',
                            'maxAmountOfParticipants',
                            'price',
                            'cook'
                        );

                    const { cook } = result[0];

                    cook.should.be
                        .an('object')
                        .that.has.all.keys(
                            'id',
                            'firstName',
                            'lastName',
                            'street',
                            'city',
                            'isActive',
                            'emailAdress',
                            'password',
                            'phoneNumber'
                        );

                    done();
                });
        });
    });
});
