import { Router } from 'express'
import { auth } from '../Helpers/authorization.js'
import { getGroupById, createGroup, deleteGroupById } from '../Controllers/groupController.js'
import { getGroupMembersByGroupId, getGroupMembersByUserId, addGroupMember, removeGroupMember, updateCurrentUserGroupMemberAccepted } from '../Controllers/groupMembersController.js'

const groupRouter = Router()

// group routet
// Get group by its id
groupRouter.get('/:id', auth, getGroupById)

// Create group and become member of it automatically
groupRouter.post('/', auth, createGroup)
/*
{
  "group_name": "New Group"
}
*/

// Delete group
groupRouter.delete('/:id', auth, deleteGroupById)

// group member routet
// Get group's all members by group id
groupRouter.get('/:group_id/members', auth, getGroupMembersByGroupId)

// Get user's groups by user id
groupRouter.get('/user/:user_id/groups', auth, getGroupMembersByUserId)

// Update user accepted by group id
groupRouter.put('/:group_id/members', auth, updateCurrentUserGroupMemberAccepted)

// Add a member to a group
groupRouter.post('/members', auth, addGroupMember)
/*
{
  "member": {
    "group_id": 1,
    "user_id": 37
  }
}
*/

// Delete a member from a group
groupRouter.delete('/:group_id/members/:user_id', auth, removeGroupMember)


export default groupRouter;