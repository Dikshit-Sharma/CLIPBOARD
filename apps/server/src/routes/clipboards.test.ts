import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

describe('clipboards API', () => {
  it('creates a clipboard and can fetch meta', async () => {
    const app = createApp()

    const created = await request(app).post('/api/clipboards').send({ expiresIn: '1h' })
    expect(created.status).toBe(200)
    expect(created.body.id).toBeTruthy()

    const meta = await request(app).get(`/api/clipboards/${created.body.id}/meta`)
    expect(meta.status).toBe(200)
    expect(meta.body.id).toBe(created.body.id)
  })
})
