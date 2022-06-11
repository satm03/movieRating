import test from 'ava'
import supertest from 'supertest'
import { app } from '../src/app.js'

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})
