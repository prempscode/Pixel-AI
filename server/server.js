import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import chatRoutes from './routes/chatRoutes.js'

const app = express()
const PORT = process.env.PORT || 5000

// middleware
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/conversations', chatRoutes)

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

start()
