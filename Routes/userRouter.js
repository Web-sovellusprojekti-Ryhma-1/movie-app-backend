import { Router } from 'express'
import { getUserById, signUpUser, signInUser, deleteCurrentUser } from '../Controllers/userController.js'
import { getUserFavorites, postCurrentUserFavorite, deleteCurrentUserFavorite } from '../Controllers/favoriteController.js'
import { deleteCurrentUserReview, getMovieReviews, getUserReviews, postCurrentUserReview } from '../Controllers/reviewController.js'
import { auth } from '../Helpers/authorization.js'
import { validateUser } from '../Helpers/userInputValidation.js'

const router = Router()


// Users
router.get("/:id", getUserById)

router.post("/signup", validateUser, signUpUser)
/*
Request body should look like this:
{
    "user": {
        "username": "myusername"
        "email": "myemail"
        "password": "mypassword"
    }
}
*/

router.post("/signin", signInUser)
/*
Request body should look like this:
{
    "user": {
        "email": "myemail"
        "password": "mypassword"
    }
}
*/

router.delete("/deletecurrentuser", auth, deleteCurrentUser)


// Favorites
router.get("/:id/favorites", getUserFavorites)

router.post("/favorites", auth, postCurrentUserFavorite)
// User needs to be logged in
/*
Request body should look like this:
{
    "tmdb_id": "99"
}
*/

router.delete("/favorites/:id", auth, deleteCurrentUserFavorite)
// User needs to be logged in




// Reviews
router.get("/:id/reviews", getUserReviews)


router.post("/reviews", auth, postCurrentUserReview)
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

router.delete("/reviews/:id", auth, deleteCurrentUserReview)
// User needs to be logged in


router.get("/movie/:id/reviews", getMovieReviews)

export default router