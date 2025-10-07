import { selectAllUsers, selectUserByEmail, insertUser, deleteUserByEmail, selectUserById } from "../Models/userModel.js"
import handleResponse from "../Helpers/responseHandler.js"
import { compare, hash } from "bcrypt"
import { ApiError } from "../Helpers/ApiError.js"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'

dotenv.config()

const getUserById = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await selectUserById(id)

        const dbUser = result.rows[0]

        const showResult = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
        }

        handleResponse(res, 200, "User returned successfully", showResult)
    } catch (error) {
        return next(error)
    }
}

const signUpUser = async (req, res,next) => {
    const { user } = req.body
    try {
        const hashedpassword = await hash(user.password, 10)
        const result = await insertUser(user.username, user.email, hashedpassword)

        const dbUser = result.rows[0]

        const showResult = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
        }

        handleResponse(res, 201, "User created successfully", showResult)
    } catch (error) {
        return next(error)
    }
}

const signInUser = async (req, res,next) => {
    const { user } = req.body
    try {
        if (!user || !user.email || !user.password) {
            throw new ApiError("Email and password are required", 400)
        }
        
        const result = await selectUserByEmail(user.email)
        if (result.rows.length === 0) {
            throw new ApiError("Invalid email or password", 401)
        }

        const dbUser = result.rows[0]

        const isMatch = await compare(user.password, dbUser.password)
        if (!isMatch) {
            throw new ApiError("Invalid email or password", 401)
        }

        const token = jwt.sign(
            { id: dbUser.id, username: dbUser.username, email: dbUser.email  },
            process.env.JWT_SECRET_KEY
        )

        const showResult = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            token,
        }

        handleResponse(res, 200, "Login successful", showResult)
    } catch (error) {
        return next(error)
    }
}

const deleteCurrentUser = async (req, res, next) => {
    try {
        const result = await deleteUserByEmail(req.user.email)

        if (result.rows.length === 0) {
            throw new ApiError("User not found", 404)
        }

        const dbUser = result.rows[0]

        const showResult = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
        }

        handleResponse(res, 200, "User deleted successfully", showResult)
    } catch (error) {
        return next(error)
    }
}

export { getUserById, signUpUser, signInUser, deleteCurrentUser }