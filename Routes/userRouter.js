import { Router } from 'express'
import { getUserById, signUpUser, signInUser, deleteCurrentUser } from '../Controllers/userController.js'
import { getUserFavorites, postCurrentUserFavorite, deleteCurrentUserFavorite } from '../Controllers/favoriteController.js'
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

router.delete("/favorites", auth, deleteCurrentUserFavorite)
// User needs to be logged in
/*
Request body should look like this:
{
    "tmdb_id": "99"
}
*/

/*

// Reviews
router.get("/:id/reviews", getUserReviews)

router.post("/reviews", auth, postCurrentUserFavorite)
// User needs to be logged in
/*
Request body should look like this:
{
    "tmdb_id": "99"
}
*/

/*

router.delete("/reviews", auth, deleteCurrentUserFavorite)
// User needs to be logged in
/*
Request body should look like this:
{
    "tmdb_id": "99"
}
*/

export default router