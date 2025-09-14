import { Router } from 'express'
import { getUsers, signUpUser, signInUser } from '../Controllers/userController.js'
import { auth } from '../Helpers/authorization.js'
import { validateUser } from '../Helpers/userInputValidation.js'

const router = Router()

router.get("/users", auth, getUsers)

router.get("/profile", auth, (req, res) => {
    res.json({ id: req.user.id, username: req.user.username, email: req.user.email})
})

router.post("/signup", validateUser, signUpUser)

router.post("/signin", signInUser)

/*
router.get("/:id", getUserById)

router.put("/:id", updateUserById)

router.delete("/:id", deleteUserById)
*/

export default router