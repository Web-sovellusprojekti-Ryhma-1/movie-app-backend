import fs from "fs"
import path from "path"
import { pool } from "../../Helpers/db.js"
import jwt from "jsonwebtoken"
import { hash } from "bcrypt"

const __dirname = import.meta.dirname

export async function initializeTestDb() {
  try {
    // varmistetaan että käytetään oikeaa schemaa testi databasessa
    await pool.query('SET search_path TO movie_app')
    const sql = fs.readFileSync(path.resolve(__dirname, "../../db.test.sql"), "utf-8")
    await pool.query(sql)
    console.log("Test database initialized")
  } catch (error) {
    console.error("Error initializing test database:", error.message)
    throw error
  }
}

export async function cleanupTestDb() {
  await pool.query('SET search_path TO movie_app')
  await pool.query('DELETE FROM reviews WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%@test.com\')')
  await pool.query('DELETE FROM favorites WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%@test.com\')')
  await pool.query('DELETE FROM group_members WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%@test.com\')')
  await pool.query('DELETE FROM users WHERE email LIKE \'%@test.com\'')
  console.log("Test database cleaned up")
}

// pitää sulkea PG pool että testit ei jää roikkumaan ja odottamaan timeouttia
export async function closePool() {
  try {
    await pool.end()
    console.log("Test database pool closed")
  } catch (e) {
    console.error("Error closing DB pool:", e?.message || e)
  }
}

export async function insertTestUser(user) {
  const hashedPassword = await hash(user.password, 10)
  const result = await pool.query(
    "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email, username",
    [user.email, hashedPassword, user.username || user.email.split('@')[0]]
  )
  console.log("Test user inserted successfully")
  return result.rows[0]
}

export async function getToken(userOrEmail) {
  const secret = process.env.JWT_SECRET_KEY
  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not set in environment")
  }

  if (typeof userOrEmail === "string") {
    const user = await getUserByEmail(userOrEmail)
    if (!user) {
      throw new Error(`User not found for email: ${userOrEmail}`)
    }
    return jwt.sign({ id: user.id, email: user.email, username: user.username }, secret)
  }

  const u = userOrEmail || {}
  return jwt.sign({ id: u.id, email: u.email, username: u.username || (u.email ? u.email.split("@")[0] : undefined) }, secret)
}

export async function createTestReview(userId, review) {
  const result = await pool.query(
    'INSERT INTO reviews (user_id, title, body, rating, tmdb_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, review.title, review.body, review.rating, review.tmdb_id]
  )
  return result.rows[0]
}

export async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0]
}

export async function safeApiCall(url, options = {}) {
  try {
    const response = await fetch(url, options)
    
    // tarkistetään että saadaanko responsesta JSONia
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error(`Expected JSON but got ${contentType}:`, text.substring(0, 200))
      throw new Error(`API returned ${contentType} instead of JSON. Server might not be running or endpoint doesn't exist.`)
    }
    
    const data = await response.json()
    return { response, data }
  } catch (error) {
    console.error(`API call failed for ${url}:`, error.message)
    throw error
  }
}