import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
}

export const googleLogin = async (req, res) => {
  const { credential } = req.body

  if (!credential) {
    return res.status(400).json({ error: 'Missing Google credential' })
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    if (!payload.email_verified) {
      return res.status(400).json({ error: 'Google email not verified' })
    }

    let user = await User.findOne({ email: payload.email })
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture
      })
    } else if (!user.googleId) {
      user.googleId = payload.sub
      await user.save()
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.cookie('token', token, cookieOptions)

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    })
  } catch (err) {
    console.error('Google login error:', err.message)
    res.status(401).json({ error: 'Invalid Google token' })
  }
}

export const logout = (_req, res) => {
  res.clearCookie('token', { path: '/' })
  res.json({ ok: true })
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
