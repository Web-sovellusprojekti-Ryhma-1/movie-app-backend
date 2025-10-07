import { expect } from "chai"
import { describe, before, after, it } from "node:test"
import { initializeTestDb, cleanupTestDb, insertTestUser, createTestReview, getToken, closePool } from "./helper/test.js"

const API_BASE = "http://localhost:3001/api";

// sitten kun reviews feature on valmis niin poistetaan tuo .skip ja voidaan testata testit
describe.skip("Review Management Tests (temporarily disabled)", () => {
    let testUser = null
    let testUserToken = null
    let testUserId = null
    
    const userCredentials = { 
        email: "reviewtest@test.com", 
        password: "password123",
        username: "reviewtest"
    }

    before(async() => {
        await initializeTestDb()
        await cleanupTestDb()
    testUser = await insertTestUser(userCredentials)
    testUserId = testUser.id
    testUserToken = await getToken(testUser)
    })

    after(async() => {
        await cleanupTestDb()
        await closePool()
    })

    describe("Creating Reviews", () => {
        it("should create a new review when authenticated", async () => {
            const newReview = {
                title: "Test Movie",
                body: "This is a great test movie with amazing cinematography.",
                rating: 4,
                tmdb_id: 12345
            }

            const response = await fetch(`${API_BASE}/review/`, {
                method: "post",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${testUserToken}`
                },
                body: JSON.stringify({ review: newReview })
            })
            const payload = await response.json()
            const result = payload?.data || payload
            const row = result?.rows?.[0] || result
            
            expect(response.status).to.equal(201)
            expect(row).to.include.all.keys(["user_id", "title", "body", "rating", "tmdb_id", "reviewed_at"])
            expect(row.title).to.equal(newReview.title)
            expect(row.body).to.equal(newReview.body)
            expect(row.rating).to.equal(newReview.rating)
            expect(row.tmdb_id).to.equal(newReview.tmdb_id)
            expect(row.user_id).to.equal(testUserId)
        })

        it("should not create review without authentication", async () => {
            const newReview = {
                title: "Unauthorized Review",
                body: "This should not be created.",
                rating: 3,
                tmdb_id: 67890
            }

            const response = await fetch(`${API_BASE}/review/`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ review: newReview })
            })
            
            expect(response.status).to.equal(401)
        })

        it("should not create review with invalid rating", async () => {
            const invalidReview = {
                title: "Invalid Rating Movie",
                body: "This has an invalid rating.",
                rating: 6, // Should be 1-5
                tmdb_id: 11111
            }

            const response = await fetch(`${API_BASE}/review/`, {
                method: "post",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${testUserToken}`
                },
                body: JSON.stringify({ review: invalidReview })
            })
            
            expect(response.status).to.equal(400)
        })

        it("should not create review with missing required fields", async () => {
            const incompleteReview = {
                title: "Incomplete Review",
                // Missing body, rating, and tmdb_id
            }

            const response = await fetch(`${API_BASE}/review/`, {
                method: "post",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${testUserToken}`
                },
                body: JSON.stringify({ review: incompleteReview })
            })
            
            expect(response.status).to.equal(400)
        })

        it("should not allow duplicate reviews for same movie by same user", async () => {
            const duplicateReview = {
                title: "Test Movie",
                body: "Another review for the same movie.",
                rating: 5,
                tmdb_id: 12345 // Same movie as first test
            }

            const response = await fetch(`${API_BASE}/review/`, {
                method: "post",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${testUserToken}`
                },
                body: JSON.stringify({ review: duplicateReview })
            })
            
            expect(response.status).to.equal(409) // Conflict
        })
    })

    describe("Browsing Reviews", () => {
        const testMovieId = 99999
        let secondUser = null
        let secondUserToken = null

        before(async() => {
            // Create a second user and reviews for testing
            const secondUserCredentials = {
                email: "reviewuser2@test.com",
                password: "password123",
                username: "reviewuser2"
            }
            secondUser = await insertTestUser(secondUserCredentials)
            secondUserToken = await getToken(secondUser)

            // Create reviews from both users for the same movie
            await createTestReview(testUserId, {
                title: "Shared Movie",
                body: "First user's review of the shared movie.",
                rating: 4,
                tmdb_id: testMovieId
            })

            await createTestReview(secondUser.id, {
                title: "Shared Movie",
                body: "Second user's review of the shared movie.",
                rating: 3,
                tmdb_id: testMovieId
            })

            // Create additional reviews for user browsing tests
            await createTestReview(testUserId, {
                title: "Another Movie",
                body: "User 1's review of another movie.",
                rating: 5,
                tmdb_id: 88888
            })
        })

        it("should get all reviews for a specific movie", async () => {
            const response = await fetch(`${API_BASE}/review/movie/${testMovieId}`, {
                method: "get"
            })
            const payload = await response.json()
            const pg = payload?.data || payload
            const data = pg?.rows || (Array.isArray(pg) ? pg : [])
            
            expect(response.status).to.equal(200)
            expect(data).to.be.an("array")
            expect(data.length).to.equal(2)
            
            // Check that reviews are from both users
            const userIds = data.map(review => review.user_id)
            expect(userIds).to.include(testUserId)
            expect(userIds).to.include(secondUser.id)
            
            // Check that all reviews are for the correct movie
            data.forEach(review => {
                expect(review.tmdb_id).to.equal(testMovieId)
                expect(review).to.include.all.keys(["user_id", "title", "body", "rating", "tmdb_id", "reviewed_at"])
            })
        })

        it("should get all reviews by a specific user", async () => {
            const response = await fetch(`${API_BASE}/review/user/${testUserId}`, {
                method: "get"
            })
            const payload = await response.json()
            const pg = payload?.data || payload
            const data = pg?.rows || (Array.isArray(pg) ? pg : [])
            
            expect(response.status).to.equal(200)
            expect(data).to.be.an("array")
            expect(data.length).to.be.at.least(2) // Should have at least 2 reviews
            
            // Check that all reviews are from the specified user
            data.forEach(review => {
                expect(review.user_id).to.equal(testUserId)
                expect(review).to.include.all.keys(["user_id", "title", "body", "rating", "tmdb_id", "reviewed_at"])
            })
        })

        it("should return empty array for movie with no reviews", async () => {
            const nonExistentMovieId = 999999
            const response = await fetch(`${API_BASE}/review/movie/${nonExistentMovieId}`, {
                method: "get"
            })
            const payload = await response.json()
            const pg = payload?.data || payload
            const data = pg?.rows || (Array.isArray(pg) ? pg : [])
            
            expect(response.status).to.equal(200)
            expect(data).to.be.an("array")
            expect(data.length).to.equal(0)
        })

        it("should return empty array for user with no reviews", async () => {
            const newUser = await insertTestUser({
                email: "noreviews@test.com",
                password: "password123",
                username: "noreviews"
            })
            
            const response = await fetch(`${API_BASE}/review/user/${newUser.id}`, {
                method: "get"
            })
            const payload = await response.json()
            const pg = payload?.data || payload
            const data = pg?.rows || (Array.isArray(pg) ? pg : [])
            
            expect(response.status).to.equal(200)
            expect(data).to.be.an("array")
            expect(data.length).to.equal(0)
        })
    })

    describe("Deleting Reviews", () => {
        let reviewToDelete = null

        before(async() => {
            // Create a review that can be deleted
            reviewToDelete = await createTestReview(testUserId, {
                title: "Review to Delete",
                body: "This review will be deleted in tests.",
                rating: 2,
                tmdb_id: 77777
            })
        })

        it("should delete own review when authenticated", async () => {
            const response = await fetch(`${API_BASE}/review/${reviewToDelete.tmdb_id}`, {
                method: "delete",
                headers: { 
                    "Authorization": `Bearer ${testUserToken}`
                }
            })
            
            expect(response.status).to.equal(200)
            
            // Verify the review is actually deleted
            const checkResponse = await fetch(`${API_BASE}/review/movie/${reviewToDelete.tmdb_id}`, {
                method: "get"
            })
            const checkPayload = await checkResponse.json()
            const pg = checkPayload?.data || checkPayload
            const checkData = pg?.rows || (Array.isArray(pg) ? pg : [])
            
            const deletedReview = checkData.find(review => 
                review.user_id === testUserId && review.tmdb_id === reviewToDelete.tmdb_id
            )
            expect(deletedReview).to.be.undefined
        })

        it("should not delete review without authentication", async () => {
            // Create another review to test deletion without auth
            const anotherReview = await createTestReview(testUserId, {
                title: "Protected Review",
                body: "This should not be deletable without auth.",
                rating: 4,
                tmdb_id: 66666
            })

            const response = await fetch(`${API_BASE}/review/${anotherReview.tmdb_id}`, {
                method: "delete"
            })
            
            expect(response.status).to.equal(401)
        })

        it("should not delete non-existent review", async () => {
            const nonExistentReviewId = 999999
            const response = await fetch(`${API_BASE}/review/${nonExistentReviewId}`, {
                method: "delete",
                headers: { 
                    "Authorization": `Bearer ${testUserToken}`
                }
            })
            
            expect(response.status).to.equal(404)
        })

        it("should not delete another user's review", async () => {
            // Create a review by second user
            const otherUserCredentials = {
                email: "otheruser@test.com",
                password: "password123",
                username: "otheruser"
            }
            const otherUser = await insertTestUser(otherUserCredentials)
            const otherUserReview = await createTestReview(otherUser.id, {
                title: "Other User's Review",
                body: "This belongs to another user.",
                rating: 3,
                tmdb_id: 55555
            })

            const response = await fetch(`${API_BASE}/review/${otherUserReview.tmdb_id}`, {
                method: "delete",
                headers: { 
                    "Authorization": `Bearer ${testUserToken}` // Using first user's token
                }
            })
            
            // Backend returns 404 when trying to delete another user's review (no matching row)
            expect([403, 404]).to.include(response.status)
        })
    })

    describe("Review Data Validation", () => {
        it("should handle reviews with boundary rating values", async () => {
            const minRatingReview = {
                title: "Min Rating Movie",
                body: "Testing minimum rating value.",
                rating: 1,
                tmdb_id: 44444
            }

            const maxRatingReview = {
                title: "Max Rating Movie",
                body: "Testing maximum rating value.",
                rating: 5,
                tmdb_id: 33333
            }

            const minResponse = await fetch(`${API_BASE}/review/`, {
                method: "post",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${testUserToken}`
                },
                body: JSON.stringify({ review: minRatingReview })
            })

            const maxResponse = await fetch(`${API_BASE}/review/`, {
                method: "post",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${testUserToken}`
                },
                body: JSON.stringify({ review: maxRatingReview })
            })
            
            expect(minResponse.status).to.equal(201)
            expect(maxResponse.status).to.equal(201)
        })

        it("should handle reviews with long text content", async () => {
            const longReview = {
                title: "Very Long Title ".repeat(10), // Long title
                body: "This is a very long review body. ".repeat(100), // Very long body
                rating: 4,
                tmdb_id: 22222
            }

            const response = await fetch("http://localhost:3001/review/", {
                method: "post",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${testUserToken}`
                },
                body: JSON.stringify({ review: longReview })
            })
            
            // Should either accept the long content or return appropriate error
            expect([201, 400]).to.include(response.status)
        })
    })
})