import handleResponse from "../Helpers/responseHandler.js";
import { ApiError } from "../Helpers/ApiError.js";
import { fetchFinnkinoEventById } from "../Helpers/finnkinoClient.js";
import { matchFinnkinoEventToTmdb } from "../Helpers/movieMatcher.js";

const matchFinnkinoEventById = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    if (!eventId) {
      throw new ApiError("eventId parameter is required", 400);
    }

    const finnkinoEvent = await fetchFinnkinoEventById(eventId);

    if (!finnkinoEvent) {
      throw new ApiError(`Finnkino event ${eventId} not found`, 404);
    }

    const result = await matchFinnkinoEventToTmdb(finnkinoEvent);

    handleResponse(res, 200, "Match computed", {
      finnkinoEventId: eventId,
      finnkinoEvent,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const matchFinnkinoEventFromPayload = async (req, res, next) => {
  try {
    const { event } = req.body;

    if (!event || typeof event !== "object") {
      throw new ApiError("Request body must include an event object", 400);
    }

    if (!event.OriginalTitle && !event.Title) {
      throw new ApiError("Event object must include Title or OriginalTitle", 400);
    }

    const result = await matchFinnkinoEventToTmdb(event);

    handleResponse(res, 200, "Match computed", {
      finnkinoEvent: event,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export { matchFinnkinoEventById, matchFinnkinoEventFromPayload };
