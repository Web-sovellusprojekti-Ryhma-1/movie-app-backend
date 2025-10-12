import { selectAllGroupShowtimesByGroupId, insertGroupShowtime, deleteGroupShowtime } from '../Models/groupShowtimeModel.js';
import handleResponse from '../Helpers/responseHandler.js'
import { ApiError } from '../Helpers/ApiError.js'
import { selectGroupById } from '../Models/groupModel.js';
import { selectAllGroupMembersByGroupId } from '../Models/groupMembersModel.js';

const getAllGroupShowtimesByGroupId = async (req, res, next) => {
    const { group_id } = req.params
    try {
        const result = await selectAllGroupShowtimesByGroupId(group_id)
        handleResponse(res, 200, 'Group showtimes retrieved successfully', result.rows)
    } catch (error) {
        return next(error)
    }
};


const addGroupShowtime = async (req, res, next) => {
    const { group_id } = req.params
    const { showtime } = req.body
    try {
        const response = await selectAllGroupMembersByGroupId(group_id)
        if (response.rows.length === 0) {
            throw new ApiError('Group does not have members', 404)
        }
        const members = response.rows

        const isMember = members.some(member => member.user_id == req.user.id);

        if (!isMember) {
            throw new ApiError('User is not a member of this group', 403);
        }

        const result = await insertGroupShowtime(group_id, showtime.finnkino_db_id, showtime.area_id, showtime.dateofshow, showtime.timeofshow)
        handleResponse(res, 201, 'Group showtime added successfully', result.rows[0])
    } catch (error) {
        return next(error)
    }
};


const removeGroupShowtime = async (req, res, next) => {
    const { group_id, showtime_id } = req.params
    try {
        const response = await selectGroupById(group_id)
        if (response.rows.length === 0) {
            throw new ApiError('Group not found', 404)
        }
        const group = response.rows[0]

        if (req.user.id != group.owner_id) {
            throw new ApiError('Only the group owner remove showtimes', 403)
        }

        const result = await deleteGroupShowtime(group_id, showtime_id)
        if (result.rowCount === 0) {
            throw new ApiError('Group showtime not found', 404)
        }
        handleResponse(res, 200, 'Group showtime removed successfully', result.rows[0])
    } catch (error) {
        return next(error)
    }
};

export { getAllGroupShowtimesByGroupId, addGroupShowtime, removeGroupShowtime };