require('dotenv').config();

const supertest = require('supertest');
const mongoose = require('mongoose');
const Users = require('../service/schemas/users');
const app = require('../app');
// const fs = require('fs');
// const path = require("path");

const {DB_TEST_HOST} = process.env;


describe('login', () => {

  beforeAll(async () => {
    await mongoose.connect(DB_TEST_HOST);
    Users.deleteMany();
  });

  afterAll( async () => {
    await mongoose.disconnect(DB_TEST_HOST);
  });

  it('login user status', async () => {
    const response = await supertest(app).post('/users/login').send({
      email: "testTests@mail.ua",
      password: "qwerty"
      });
      // console.log(response);
      // await fs.writeFile(path.resolve("./logTest.json"), response, "utf-8");

      //відповідь повина мати статус-код 200
    expect(response.statusCode).toBe(200);
  });

  it('login user token', async () => {
    const response = await supertest(app).post('/users/login').send({
      email: "testTests@mail.ua",
      password: "qwerty"
      });
    // у відповіді повинен повертатися токен
    expect(response._body.token).toBeTruthy();
  });

  it('login user email and subscription', async () => {
    const response = await supertest(app).post('/users/login').send({
      email: "testTests@mail.ua",
      password: "qwerty"
      });
    // у відповіді повинен повертатися об'єкт user з 2 полями email и subscription з типом даних String
    expect(response._body.user.email).toBe('testTests@mail.ua');
    expect(response._body.user.subscription).toBe('starter');
  });

});