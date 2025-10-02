import { selectGroupById, insertGroup, deleteGroup } from '../Models/groupModel.js'
import handleResponse from '../Helpers/responseHandler.js'
import { ApiError } from '../Helpers/ApiError.js'
import { insertGroupMember } from '../Models/groupMembersModel.js';

const getGroupById = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await selectGroupById(id)
        if (result.rows.length === 0) {
            throw new ApiError('Group not found', 404)
        }
        handleResponse(res, 200, 'Group retrieved successfully', result.rows[0])
    } catch (error) {
        return next(error)
    }
};

const createGroup = async (req, res, next) => {
    const { group_name } = req.body
    const owner_id = req.user.id
    try {
        const result = await insertGroup(group_name, owner_id)
        await insertGroupMember(owner_id, result.rows[0].id, true)

        handleResponse(res, 201, 'Group created successfully', result.rows[0])
    } catch (error) {
        return next(error)
    }
};

const deleteGroupById = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await deleteGroup(id)
        if (result.rowCount === 0) {
            throw new ApiError('Group not found', 404)
        }
        handleResponse(res, 200, 'Group deleted successfully')
    } catch (error) {
        return next(error)
    }
};

export { getGroupById, createGroup, deleteGroupById };