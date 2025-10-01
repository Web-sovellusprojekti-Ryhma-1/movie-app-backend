import { Router } from 'express'
import { deleteCurrentUserReview, getMovieReviews, getUserReviews, postCurrentUserReview } from '../Controllers/reviewController.js'
import { auth } from '../Helpers/authorization.js'

const router = Router()



// Reviews
router.get("/user/:id", getUserReviews)


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

router.delete("/:id", auth, deleteCurrentUserReview)
// User needs to be logged in

router.get("/movie/:id/reviews", getMovieReviews)


export default router