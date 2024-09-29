import { Router } from "express";
import {
  createApp,
  createPlan,
  createTask,
  fetchActions,
  fetchAllTasks,
  fetchApplications,
  fetchPlans,
  fetchUserApplications,
  updateApplication,
  updateTask,
} from "../../controllers/tms";
import { authorizedGroups, validateCookie } from "../../middleware/auth";
import { belongsInApplication, validateTaskChange } from "../../middleware/tms";

const router = Router();

router.use([validateCookie]);

//* Application
router.post("/fetchApplications", [
  authorizedGroups(["PL"]),
  fetchApplications,
]);
router.get("/fetchUserApplications", fetchUserApplications);
router.post("/fetchActions", fetchActions);
router.post("/createApplication", [authorizedGroups(["PL"]), createApp]);
router.post("/updateApplication", [
  authorizedGroups(["PL"]),
  updateApplication,
]);

//* Plan
router.post("/fetchPlans", [belongsInApplication, fetchPlans]);
router.post("/createPlan", [
  authorizedGroups(["PM"]),
  belongsInApplication,
  createPlan,
]);

//* Task
router.post("/fetchTasks", [belongsInApplication, fetchAllTasks]);
router.post("/createTask", [belongsInApplication, createTask]);
router.post("/updateTask", [
  belongsInApplication,
  validateTaskChange,
  updateTask,
]);

export default router;
