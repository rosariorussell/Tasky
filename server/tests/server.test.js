const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const {app} = require('./../server')
const {Task} = require('./../models/task')

const tasks = [{
  _id: new ObjectID(),
  text: 'First test task'
}, {
  _id: new ObjectID(),
  text: 'Second test task',
  completed: true,
  completedAt: 123
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

describe('GET /tasks/:id', () => {
  it('should return task doc', (done) => {
    request(app)
      .get(`/tasks/${tasks[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.task.text).toBe(tasks[0].text)
      })
      .end(done)
  })

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString()

    request(app)
      .get(`/tasks/${hexId}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/tasks/123')
      .expect(404)
      .end(done)
  })
})

describe('DELETE /tasks/:id', () => {
  it('should remove a task', (done) => {
    var hexId = tasks[1]._id.toHexString()

    request(app)
      .delete(`/tasks/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.task._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Task.findById(hexId).then((task) => {
          expect(task).toNotExist()
          done()
        }).catch((e) => done(e))
      })
  })

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString()

    request(app)
      .delete(`/tasks/${hexId}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/tasks/123')
      .expect(404)
      .end(done)
  })
})

describe('PATCH /tasks/:id', () => {
  it('should update the task', (done) => {
    var hexId = tasks[0]._id.toHexString()
    var text = 'This should be the new text'

    request(app)
      .patch(`/tasks/${hexId}`)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.task.text).toBe(text)
        expect(res.body.task.completed).toBe(true)
        expect(res.body.task.completedAt).toBeA('number')
      })
      .end(done)
  })

  it('should clear completedAt when task is not completed', (done) => {
    var hexId = tasks[1]._id.toHexString()
    var text = 'This should be the new text (2nd task)'

    request(app)
      .patch(`/tasks/${hexId}`)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.task.text).toBe(text)
        expect(res.body.task.completed).toBe(false)
        expect(res.body.task.completedAt).toNotExist()
      })
      .end(done)
  })
})
