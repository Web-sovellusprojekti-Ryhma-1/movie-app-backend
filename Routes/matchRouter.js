import { Router } from "express";
import { matchFinnkinoEventById, matchFinnkinoEventFromPayload } from "../Controllers/matchController.js";

const router = Router();

router.get("/finnkino/:eventId", matchFinnkinoEventById);
router.post("/finnkino", matchFinnkinoEventFromPayload);

export default router;
