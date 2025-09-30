import { selectAllFavoritesByUserId, insertUserFavorite, deleteFavorite } from "../Models/favoriteModel.js"
import handleResponse from "../Helpers/responseHandler.js"
import { ApiError } from "../Helpers/ApiError.js"

// Favorites are public knowledge
const getUserFavorites = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await selectAllFavoritesByUserId(id)
        handleResponse(res, 200, "All favorites returned successfully", result)
    } catch (error) {
        return next(error)
    }
}

// Only logged in user can add favorites to their own account
const postCurrentUserFavorite = async (req, res,next) => {
    const { tmdb_id } = req.body
    try {
        const result = await insertUserFavorite(req.user.id, tmdb_id)
        handleResponse(res, 201, "Favorite added successfully", result)
    } catch (error) {
        return next(error)
    }
}

// Only logged in user can delete favorites from their own account
const deleteCurrentUserFavorite = async (req, res, next) => {
    const { tmdb_id } = req.params
    try {
        const result = await deleteFavorite(req.user.id, tmdb_id)

        if (result.rows.length === 0) {
            throw new ApiError("Favorite not found", 404)
        }

        handleResponse(res, 200, "Favorite deleted successfully", result)
    } catch (error) {
        return next(error)
    }
}

export { getUserFavorites, postCurrentUserFavorite, deleteCurrentUserFavorite }