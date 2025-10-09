import { expect } from "chai"
import { describe, before, after, it } from "node:test"
import { initializeTestDb, cleanupTestDb, insertTestUser, createTestReview, closePool } from "./helper/test.js"

const API_BASE = "http://localhost:3001/api";

describe("Review Browsing Tests", () => {
  const movieIdShared = 99999
  const movieIdOther = 88888
  let userA = null
  let userB = null

  before(async () => {
    await initializeTestDb()
    await cleanupTestDb()

    // luodaan pari käyttäjää testiä varte
    userA = await insertTestUser({ email: "browse_a@test.com", password: "password123", username: "browse_a" })
    userB = await insertTestUser({ email: "browse_b@test.com", password: "password123", username: "browse_b" })

    // luodaan kummallekin käyttäjälle arvostelut ja testiä varten samalla elokuvan id:llä
    await createTestReview(userA.id, {
      title: "Shared Movie A",
      body: "User A review for shared movie",
      rating: 4,
      tmdb_id: movieIdShared,
    })
    await createTestReview(userB.id, {
      title: "Shared Movie B",
      body: "User B review for shared movie",
      rating: 3,
      tmdb_id: movieIdShared,
    })

    // luodaan myös toiselle käyttäjälle eri elukvan id:lle arvostelu
    await createTestReview(userA.id, {
      title: "Another Movie",
      body: "User A review for another movie",
      rating: 5,
      tmdb_id: movieIdOther,
    })
  })

  after(async () => {
    await cleanupTestDb()
    await closePool()
  })
  // haetaan projektin urlin kautta elukuvan arvostelut mutta endopoint on testiä varten tehty id
  it("should get all reviews for a specific movie", async () => {
    const response = await fetch(`${API_BASE}/review/movie/${movieIdShared}`, { method: "get" })
    const payload = await response.json()
    const pg = payload?.data || payload
    const data = pg?.rows || (Array.isArray(pg) ? pg : [])

    expect(response.status).to.equal(200)
    expect(data).to.be.an("array")
    expect(data.length).to.equal(2)

    // mapataan userIdt ja tarkistetaan arvostelut
    const userIds = data.map(r => r.user_id)
    expect(userIds).to.include(userA.id)
    expect(userIds).to.include(userB.id)

    data.forEach(r => {
      expect(Number(r.tmdb_id)).to.equal(movieIdShared)
      expect(r).to.include.all.keys(["user_id", "title", "body", "rating", "tmdb_id", "reviewed_at"])
    })
  })

  it("should get all reviews by a specific user", async () => {
    const response = await fetch(`${API_BASE}/review/user/${userA.id}`, { method: "get" })
    const payload = await response.json()
    const pg = payload?.data || payload
    const data = pg?.rows || (Array.isArray(pg) ? pg : [])

    expect(response.status).to.equal(200)
    expect(data).to.be.an("array")
    expect(data.length).to.be.at.least(2)

    data.forEach(r => {
      expect(r.user_id).to.equal(userA.id)
      expect(r).to.include.all.keys(["user_id", "title", "body", "rating", "tmdb_id", "reviewed_at"])
    })
  })

  it("should return empty array for movie with no reviews", async () => {
    const nonExistentMovieId = 123456789
    const response = await fetch(`${API_BASE}/review/movie/${nonExistentMovieId}`, { method: "get" })
    const payload = await response.json()
    const pg = payload?.data || payload
    const data = pg?.rows || (Array.isArray(pg) ? pg : [])

    expect(response.status).to.equal(200)
    expect(data).to.be.an("array")
    expect(data.length).to.equal(0)
  })

  it("should return empty array for user with no reviews", async () => {
    const userC = await insertTestUser({ email: "browse_c@test.com", password: "password123", username: "browse_c" })
    const response = await fetch(`${API_BASE}/review/user/${userC.id}`, { method: "get" })
    const payload = await response.json()
    const pg = payload?.data || payload
    const data = pg?.rows || (Array.isArray(pg) ? pg : [])

    expect(response.status).to.equal(200)
    expect(data).to.be.an("array")
    expect(data.length).to.equal(0)
  })
})