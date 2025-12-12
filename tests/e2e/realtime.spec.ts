import { test, expect } from '@playwright/test'

test('two clients see realtime content updates', async ({ browser, request, baseURL }) => {
  const apiBase = process.env.E2E_API_BASE_URL || 'http://localhost:8080'

  const created = await request.post(`${apiBase}/api/clipboards`, {
    data: { expiresIn: '1h', allowUploads: true }
  })
  expect(created.ok()).toBeTruthy()
  const body = await created.json()
  const id = body.id as string
  const token = body.tokens.writeToken as string

  const ctxA = await browser.newContext()
  const ctxB = await browser.newContext()
  const pageA = await ctxA.newPage()
  const pageB = await ctxB.newPage()

  await pageA.goto(`${baseURL}/c/${id}?token=${encodeURIComponent(token)}`)
  await pageB.goto(`${baseURL}/c/${id}?token=${encodeURIComponent(token)}`)

  const editorA = pageA.locator('[data-testid="editor"] .tiptap')
  const editorB = pageB.locator('[data-testid="editor"] .tiptap')

  await expect(editorA).toBeVisible()
  await expect(editorB).toBeVisible()

  await editorA.click()
  await pageA.keyboard.type('hello from A')

  await expect(editorB).toContainText('hello from A', { timeout: 10_000 })

  await ctxA.close()
  await ctxB.close()
})
