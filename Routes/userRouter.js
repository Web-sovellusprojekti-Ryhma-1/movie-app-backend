import { Router } from 'express'
import { getUsers, createUser, getUserById, updateUserById, deleteUserById } from '../Controllers/userController.js'

const router = Router()

router.get("/", getUsers)

router.post("/", createUser)

router.get("/:id", getUserById)

router.put("/:id", updateUserById)

router.delete("/:id", deleteUserById)


export default router