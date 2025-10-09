import { Router } from 'express'
import { deleteCurrentUserReview, getMovieReviews, getUserReviews, postCurrentUserReview } from '../Controllers/reviewController.js'
import { auth } from '../Helpers/authorization.js'

const router = Router()


router.get("/user/:id", getUserReviews)

router.get("/movie/:id", getMovieReviews)

router.post("/", auth, postCurrentUserReview)
// User needs to be logged in
/*
Request body should look like this:
{
    "review": {
        "title": "Movie Title",
        "body": "My review of the movie",
        "rating": 3,
        "tmdb_id": "99"
    }
    
}
*/

router.put("/", auth, getUserReviews)
// User needs to be logged in
/*
Request body should look like this:
{
    "review": {
        "title": "Movie Title",
        "body": "My review of the movie",
        "rating": 3,
        "tmdb_id": "99"
    }
    
}
*/

router.delete("/:id", auth, deleteCurrentUserReview)
// User needs to be logged in



export default router