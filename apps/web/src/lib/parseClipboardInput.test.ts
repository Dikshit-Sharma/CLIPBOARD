import { describe, expect, it } from 'vitest'
import { parseClipboardInput } from './parseClipboardInput'

describe('parseClipboardInput', () => {
  it('parses bare code', () => {
    expect(parseClipboardInput('Abc123')).toEqual({ id: 'Abc123' })
  })

  it('parses /c/:id url', () => {
    expect(parseClipboardInput('/c/Abc123?token=hello')).toEqual({ id: 'Abc123', token: 'hello' })
  })

  it('rejects invalid', () => {
    expect(parseClipboardInput('')).toBeNull()
    expect(parseClipboardInput('!!!')).toBeNull()
  })
})
