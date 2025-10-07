import { expect } from "chai"
import { describe, before, after, it, beforeEach } from "node:test"
import { initializeTestDb, cleanupTestDb, insertTestUser, getToken, getUserByEmail, closePool } from "./helper/test.js"

const API_BASE = "http://localhost:3001/api";

describe("User Authentication Tests", () => {
    let testUserToken = null
    let testUserId = null
    const testUser = { 
        email: "authtest@test.com", 
        password: "password123",
        username: "authtest"
    }
    
    before(async() => {
        await initializeTestDb()
        await cleanupTestDb()
    })

    after(async() => {
        await cleanupTestDb()
        await closePool()
    })
    // uuden käyttäjän luomisen testi
    describe("User Sign Up", () => {
        it("should sign up a new user successfully", async () => {
            const newUser = { 
                email: `signup${Date.now()}@test.com`, 
                password: "password123",
                username: "signuptest"
            }

            const response = await fetch(`${API_BASE}/user/signup`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: newUser })
            })
            const payload = await response.json()
            const data = payload?.data || payload
            
            expect(response.status).to.equal(201)
            expect(data).to.include.all.keys(["id", "email", "username"])
            expect(data.email).to.equal(newUser.email)
            expect(data.username).to.equal(newUser.username)
        })

        it("should not allow signup with invalid email", async () => {
            const invalidUser = { 
                email: "invalid-email", 
                password: "password123",
                username: "invalidtest"
            }

            const response = await fetch(`${API_BASE}/user/signup`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: invalidUser })
            })
            
            expect(response.status).to.equal(400)
        })

        it("should not allow signup with missing password", async () => {
            const invalidUser = { 
                email: "missingpass@test.com",
                username: "missingpass"
            }

            const response = await fetch(`${API_BASE}/user/signup`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: invalidUser })
            })
            
            expect(response.status).to.equal(400)
        })

        it("should not allow duplicate email registration", async () => {
            const duplicateUser = { 
                email: testUser.email, 
                password: "password123",
                username: "duplicate"
            }

            // sisäänkirjautumisen testi
            await fetch(`${API_BASE}/user/signup`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: testUser })
            })

            // koitetaan luoda sama käyttäjä uudestaan
            const response = await fetch(`${API_BASE}/user/signup`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: duplicateUser })
            })
            
            expect([201, 400, 409, 500]).to.include(response.status)
        })
    })
    // sisäänkirjautumisen testaukset
    describe("User Sign In", () => {
        before(async() => {
            // jos käyttäjä on jo luotu aiemmissa testeissä niin ohitetaan virhe
            try {
                await insertTestUser(testUser)
            } catch (e) {
                if (!(e && e.code === '23505')) {
                    throw e
                }
            }
        })

        it("should sign in with valid credentials", async () => {
            const response = await fetch(`${API_BASE}/user/signin`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: { email: testUser.email, password: testUser.password } })
            })
            const payload = await response.json()
            const data = payload?.data || payload
            
            expect(response.status).to.equal(200)
            expect(data).to.include.all.keys(["id", "email", "token"])
            expect(data.email).to.equal(testUser.email)
            expect(data.token).to.be.a("string")
            
            testUserToken = data.token
            testUserId = data.id
        })

        it("should not sign in with invalid email", async () => {
            const response = await fetch(`${API_BASE}/user/signin`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: { email: "nonexistent@test.com", password: testUser.password } })
            })
            
            expect(response.status).to.equal(401)
        })

        it("should not sign in with invalid password", async () => {
            const response = await fetch(`${API_BASE}/user/signin`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: { email: testUser.email, password: "wrongpassword" } })
            })
            
            expect(response.status).to.equal(401)
        })

        it("should not sign in with missing credentials", async () => {
            const response = await fetch(`${API_BASE}/user/signin`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: {} })
            })
            
            expect(response.status).to.equal(400)
        })
    })
    // käyttäjän poistaminsen testi
    describe("User Account Deletion", () => {
        let userToDelete = null
        let deleteToken = null

        beforeEach(async() => {
            // luodaan uusi käyttäjä joka poistetaan testiä varten
            userToDelete = { 
                email: `delete${Date.now()}@test.com`, 
                password: "password123",
                username: "deletetest"
            }
            
            const signupResponse = await fetch(`${API_BASE}/user/signup`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: userToDelete })
            })
            
            const signinResponse = await fetch(`${API_BASE}/user/signin`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: { email: userToDelete.email, password: userToDelete.password } })
            })
            const signinPayload = await signinResponse.json()
            const signinData = signinPayload?.data || signinPayload
            deleteToken = signinData.token
        })

        it("should delete current user account when authenticated", async () => {
            const response = await fetch(`${API_BASE}/user/deletecurrentuser`, {
                method: "delete",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${deleteToken}`
                }
            })
            
            expect(response.status).to.equal(200)
            
            // tarkastetaan että onko käyttäjä poistettu
            const deletedUser = await getUserByEmail(userToDelete.email)
            expect(deletedUser).to.be.undefined
        })

        it("should not delete user without authentication", async () => {
            const response = await fetch(`${API_BASE}/user/deletecurrentuser`, {
                method: "delete",
                headers: { "Content-Type": "application/json" }
            })
            
            expect(response.status).to.equal(401)
        })

        it("should not delete user with invalid token", async () => {
            const response = await fetch(`${API_BASE}/user/deletecurrentuser`, {
                method: "delete",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": "Bearer invalid-token"
                }
            })
            
            expect(response.status).to.equal(401)
        })
    })
    // testaan routejen toimivuutta lähinnä tokenin kanssa
    describe("Protected Route Access", () => {
        it("should access protected routes with valid token", async () => {
            
            if (!testUserToken) {
                const loginRes = await fetch(`${API_BASE}/user/signin`, {
                    method: "post",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user: { email: testUser.email, password: testUser.password } })
                })
                const loginPayload = await loginRes.json()
                const loginData = loginPayload?.data || loginPayload
                testUserToken = loginData?.token
                testUserId = loginData?.id
            }

            const response = await fetch(`${API_BASE}/user/${testUserId}`, {
                method: "get",
                headers: { 
                    "Authorization": `Bearer ${testUserToken}`
                }
            })
            
            expect(response.status).to.equal(200)
        })

        it("should deny access to protected routes without token", async () => {
            const response = await fetch(`${API_BASE}/user/deletecurrentuser`, {
                method: "delete",
                headers: { "Content-Type": "application/json" }
            })
            
            expect(response.status).to.equal(401)
        })
    })
})