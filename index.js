import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool } from './Helpers/db.js'
import errorHandler from './Helpers/errorHandler.js'
import userRouter from './Routes/userRouter.js'
import apirouter from './apis/tmdbapi.js'
import finnkinoRouter from './apis/finnkinoapi.js'
import groupRouter from './Routes/groupRouter.js'

dotenv.config()

const port = process.env.PORT

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.status(200).json({result: "Success"})
})

app.use('/api/tmdb', apirouter) // tmdb api
app.use('/api/finnkino', finnkinoRouter) // finnkino api

app.use('/api/user', userRouter)

app.use('/api/favorites', userRouter)

app.use('/api/reviews', userRouter)

app.use('/api/group', groupRouter)

app.use(errorHandler)

// Test database connection
app.get("/db", async(req, res) => {
    const result = await pool.query("SELECT current_database()")
    res.send(`The database name is: ${result.rows[0].current_database}`)
})

// Server running
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})