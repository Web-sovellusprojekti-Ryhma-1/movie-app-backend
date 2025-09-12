import { selectAllUsers, insertUsers } from "../Models/userModel.js"
import handleResponse from "../Helpers/responseHandler.js"
import { hash } from "bcrypt"

const getUsers = async (req, res,next) => {
    try {
        const result = await selectAllUsers()
        handleResponse(res, 200, "All users returned successfully", result)
    } catch (error) {
        return next(error)
    }
}

const createUser = async (req, res,next) => {
    const { user } = req.body
    try {
        const hashedpassword = await hash(user.password, 10)
        const result = await insertUsers(user.username, user.email, hashedpassword)
        handleResponse(res, 201, "User created successfully", result)
    } catch (error) {
        return next(error)
    }
}


export { getUsers, createUser }