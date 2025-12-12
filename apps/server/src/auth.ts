import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { ClipboardRole } from './types.js'

export function sha256Hex(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export function generateToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString('base64url')
}

export type ClipboardSession = {
  clipboardId: string
  role: ClipboardRole
}

export function signSession(session: ClipboardSession) {
  const secret = process.env.JWT_SECRET || 'dev-insecure-secret'
  return jwt.sign(session, secret, { expiresIn: '12h' })
}

export function verifySession(token: string): ClipboardSession {
  const secret = process.env.JWT_SECRET || 'dev-insecure-secret'
  return jwt.verify(token, secret) as ClipboardSession
}
