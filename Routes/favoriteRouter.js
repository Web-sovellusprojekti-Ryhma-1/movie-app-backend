import { Router } from 'express'
import { getUserFavorites, postCurrentUserFavorite, deleteCurrentUserFavorite } from '../Controllers/favoriteController.js'
import { auth } from '../Helpers/authorization.js'

const router = Router()


router.get("/:id", getUserFavorites)

router.post("/", auth, postCurrentUserFavorite)
// User needs to be logged in
/*
Request body should look like this:
{
    "tmdb_id": "99"
}
*/

router.delete("/:id", auth, deleteCurrentUserFavorite)
// User needs to be logged in

export default router