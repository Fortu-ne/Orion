import rateLimit from "express-rate-limit";
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'


// BullMQ Jobs
import { scheduleApodFetcher } from './jobs/apodFetcher.mjs'
import { scheduleIssPoller } from './jobs/issPoller.mjs'

import route from "./routes/routes.mjs";

import rateLimiter from './middleware/rateLimit.mjs'


dotenv.config() 

const app = express();

const limit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many a"
})



app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL
  ].filter(Boolean)   // drops undefined if CLIENT_URL isn't set
}))
app.use(morgan('dev'))
app.use(express.json())

app.use('/api', rateLimiter)

// Routes
app.use(route)


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})
 

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  })
})
 

const PORT = process.env.PORT || 3000
 
app.listen(PORT, async () => {
  console.log(`🚀 Orion server running on port ${PORT}`)
 
  try {
    await scheduleApodFetcher()
    await scheduleIssPoller()
    console.log('All background jobs started')
  } catch (err) {
    console.error(' Failed to start background jobs:', err.message)
  }
})


