import { Router } from 'express'
import { getUserByEmail, getUserById, signUpUser, signInUser, deleteCurrentUser } from '../Controllers/userController.js'
import { auth } from '../Helpers/authorization.js'
import { validateUser } from '../Helpers/userInputValidation.js'

const router = Router()

router.get("/email", getUserByEmail)
/*
api/user/email?email=myemail
*/

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