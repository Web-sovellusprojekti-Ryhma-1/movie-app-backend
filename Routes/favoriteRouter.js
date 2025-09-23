import { Router } from 'express'
import { getUserFavorites, postCurrentUserFavorite, deleteCurrentUserFavorite } from '../Controllers/userController.js'
import { auth } from '../Helpers/authorization.js'

const router = Router()

router.get("/userfavorites", getUserFavorites)

router.post("/addfavorite", auth, postCurrentUserFavorite)

router.delete("/deletefavorite", auth, deleteCurrentUserFavorite)

export default router