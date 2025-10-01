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


export default router