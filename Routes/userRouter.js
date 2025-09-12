import { Router } from 'express'
import { getUsers, createUser, signInUser } from '../Controllers/userController.js'

const router = Router()

router.get("/", getUsers)

router.post("/", createUser)

router.post("/signin", signInUser)

/*
router.get("/:id", getUserById)

router.put("/:id", updateUserById)

router.delete("/:id", deleteUserById)
*/

export default router