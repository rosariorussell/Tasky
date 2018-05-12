const expect = require('expect')
const request = require('supertest')

const {app} = require('./../server')
const {Task} = require('./../models/task')

const tasks = [{
  text: 'First test task'
}, {
  text: 'Second test task'
}]

beforeEach((done) => {
  Task.remove({}).then(() => {
    return Task.insertMany(tasks)
  }).then(() => done())
})

describe('POST /tasks', () => {
  it('should create a new task', (done) => {
    var text = 'Test task text'

    request(app)
      .post('/tasks')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Task.find({text}).then((tasks) => {
          expect(tasks.length).toBe(1)
          expect(tasks[0].text).toBe(text)
          done()
        }).catch((e) => done(e))
      })
  })

  it('should not create task with invalid body data', (done) => {
    request(app)
      .post('/tasks')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Task.find().then((tasks) => {
          expect(tasks.length).toBe(2)
          done()
        }).catch((e) => done(e))
      })
  })
})

describe('Get /tasks', () => {
  it('should get all tasks', (done) => {
    request(app)
      .get('/tasks')
      .expect(200)
      .expect((res) => {
        expect(res.body.tasks.length).toBe(2)
      })
      .end(done)
  })
})