import { Router } from 'express'
import { auth } from '../Helpers/authorization.js'
import { getGroupById, createGroup, deleteGroupById } from '../Controllers/groupController.js'
import { getGroupMembersByGroupId, getGroupMembersByUserId, addGroupMember, removeGroupMember, updateCurrentUserGroupMemberAccepted } from '../Controllers/groupMembersController.js'

const groupRouter = Router()

// group routet
groupRouter.get('/:id', auth, getGroupById)
groupRouter.post('/', auth, createGroup)
groupRouter.delete('/:id', auth, deleteGroupById)

// group member routet
groupRouter.get('/:group_id/members', auth, getGroupMembersByGroupId)
groupRouter.get('/user/:user_id/groups', auth, getGroupMembersByUserId)
groupRouter.put('/:group_id/members', auth, updateCurrentUserGroupMemberAccepted)
groupRouter.post('/members', auth, addGroupMember)
groupRouter.delete('/members', auth, removeGroupMember)

export default groupRouter;