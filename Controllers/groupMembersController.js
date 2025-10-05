import { selectAllGroupMembersByGroupId, selectAllGroupMembersByUserId, updateGroupMemberAcceptedById, insertGroupMember, deleteGroupMember } from '../Models/groupMembersModel.js'
import handleResponse from '../Helpers/responseHandler.js'
import { ApiError } from '../Helpers/ApiError.js'

const getGroupMembersByGroupId = async (req, res, next) => {
    const { group_id } = req.params
    try {
        const result = await selectAllGroupMembersByGroupId(group_id)
        handleResponse(res, 200, 'Group members retrieved successfully', result.rows)
    } catch (error) {
        return next(error)
    }
};

const getGroupMembersByUserId = async (req, res, next) => {
    const { user_id } = req.params
    try {
        const result = await selectAllGroupMembersByUserId(user_id)
        handleResponse(res, 200, 'Groups retrieved successfully', result.rows)
    } catch (error) {
        return next(error)
    }
};

const addGroupMember = async (req, res, next) => {
    const { member } = req.body
    try {
        const result = await insertGroupMember(member.user_id, member.group_id, false)
        handleResponse(res, 201, 'Group member added successfully', result.rows[0])
    } catch (error) {
        return next(error)
    }
};

const updateCurrentUserGroupMemberAccepted = async (req, res, next) => {
    const { group_id } = req.params
    try {
        const result = await updateGroupMemberAcceptedById(group_id, req.user.id)
        handleResponse(res, 201, 'Group member updated successfully', result.rows[0])
    } catch (error) {
        return next(error)
    }
};

const removeGroupMember = async (req, res, next) => {
    const { group_id, user_id } = req.params
    try {
        const result = await deleteGroupMember(user_id, group_id)
        if (result.rowCount === 0) {
            throw new ApiError('Group member not found', 404)
        }
        handleResponse(res, 200, 'Group member removed successfully')
    } catch (error) {
        return next(error)
    }
};

export { getGroupMembersByGroupId, getGroupMembersByUserId, addGroupMember, updateCurrentUserGroupMemberAccepted, removeGroupMember };