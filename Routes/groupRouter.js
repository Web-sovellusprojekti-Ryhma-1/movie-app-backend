import { Router } from 'express'
import { auth } from '../Helpers/authorization.js'
import { getAllGroups, getGroupById, createGroup, deleteGroupById, putGroup } from '../Controllers/groupController.js'
import { getGroupMembersByGroupId, getGroupMembersByUserId, addGroupMember, removeGroupMember, updateCurrentUserGroupMemberAccepted } from '../Controllers/groupMembersController.js'
import { getAllGroupShowtimesByGroupId, addGroupShowtime, removeGroupShowtime } from '../Controllers/groupShowtimesController.js'


const groupRouter = Router()

// group routet
// Get all groups
groupRouter.get('/', getAllGroups)

// Get group by its id
groupRouter.get('/:id', getGroupById)

// Create group and become member of it automatically
groupRouter.post('/', auth, createGroup)
/*
{
  "group_name": "New Group"
}
*/

// Edit group name
groupRouter.put('/:id', auth, putGroup)
/*
{
  "group_name": "New Group"
}
*/

// Delete group
groupRouter.delete('/:id', auth, deleteGroupById)



// group member routet
// Get group's all members by group id
groupRouter.get('/:group_id/members', getGroupMembersByGroupId)

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



// Group showtimes
// Get group's all showtimes
groupRouter.get('/:group_id/showtime', getAllGroupShowtimesByGroupId)

// Add a showtime to a group
groupRouter.post('/:group_id/showtime', auth, addGroupShowtime)
/*
{
    "showtime": {
        finnkino_db_id: "1",
        area_id: "2",
        dateofshow: 5-12-2025
    }
}
*/

// Delete showtime from a group
groupRouter.delete('/:group_id/showtime/:showtime_id', auth, removeGroupShowtime)

export default groupRouter;