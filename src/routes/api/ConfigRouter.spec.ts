'use strict'

import req from 'supertest'
import { loadApp } from '../../config/AppLoader'
import { ConfigResponse } from '../../types/api/config/ConfigResponse'

jest.useFakeTimers()

test('[GET] /', async () => {
  const app = await loadApp()
  const res = await req(app).get('/config/')
  // await expect(res.text.valorM2).not.toBeNaN()
  const obj = new ConfigResponse(res.text).toDTO()
  expect(obj.valorM2).not.toBeNull()
  expect(obj.valorM2).not.toBeUndefined()
  expect(obj.valorM2).not.toBeNaN()
})
