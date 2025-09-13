import jwt from 'jsonwebtoken'
import { ApiError } from './ApiError.js'

const auth = (req,res,next) => {
    const header = req.headers['authorization']

    if(!header || !header.startsWith("Bearer ")) {
        return next(new ApiError("No token provided", 401))
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        next()
    } catch(error) {
        return next(new ApiError("Invalid or expired token", 401))
    }
}
export { auth }