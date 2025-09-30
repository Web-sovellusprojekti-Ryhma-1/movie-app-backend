import { selectAllReviewsByUserId, selectAllReviewsByMovieId, insertReview, deleteReview } from "../Models/reviewModel.js"
import handleResponse from "../Helpers/responseHandler.js"
import { ApiError } from "../Helpers/ApiError.js"

// Reviews are public knowledge
const getUserReviews = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await selectAllReviewsByUserId(id)
        handleResponse(res, 200, "All movies returned successfully", result)
    } catch (error) {
        return next(error)
    }
}

const getMovieReviews = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await selectAllReviewsByMovieId(id)
        handleResponse(res, 200, "All movies returned successfully", result)
    } catch (error) {
        return next(error)
    }
}

// Only logged in user can make new reviews
const postCurrentUserReview = async (req, res,next) => {
    const { review } = req.body
    try {
        if (review.rating < 1 || review.rating > 5) {
            throw new ApiError("Rating must be between 1-5", 400)
        }

        const result = await insertReview(req.user.id, review.title, review.body, review.rating, review.tmdb_id)
        handleResponse(res, 201, "Review added successfully", result)
    } catch (error) {
        return next(error)
    }
}

// Only logged in user can delete reviews they have made
const deleteCurrentUserReview = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await deleteReview(req.user.id, id)

        if (result.rows.length === 0) {
            throw new ApiError("Review not found", 404)
        }

        handleResponse(res, 200, "Review deleted successfully", result)
    } catch (error) {
        return next(error)
    }
}

export { getUserReviews, getMovieReviews, postCurrentUserReview, deleteCurrentUserReview }