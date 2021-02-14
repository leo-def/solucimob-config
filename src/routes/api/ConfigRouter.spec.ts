'use strict'

import req from 'supertest'
import { loadApp } from '../../config/AppLoader'

jest.useFakeTimers()

test('[GET] /', async () => {
  const app = await loadApp()
  const res = await req(app).get('/config/')
  await expect(res.text.valorM2).not.toBeNaN()
})
