import { Router } from "express";
import {
  checkActions,
  createApp,
  createPlan,
  createTask,
  fetchAllApplications,
  fetchAllTasks,
  fetchApplication,
  fetchPlans,
  updateApplication,
  updateTask,
} from "../../controllers/tms";
import { authorizedGroups, validateCookie } from "../../middleware/auth";
import { belongsInApplication, validateTaskChange } from "../../middleware/tms";

const router = Router();

router.use([validateCookie]);

//* Application
router.get("/applications", [authorizedGroups(["PL"]), fetchAllApplications]);
router.get("/:appAcronym/actions", [belongsInApplication, checkActions]);
router.get("/applications/:appAcronym", [
  belongsInApplication,
  fetchApplication,
]);
router.post("/applications", [authorizedGroups(["PL"]), createApp]);
router.put("/applications", [authorizedGroups(["PL"]), updateApplication]);

//* Plan
router.get("/:appAcronym/plans", [belongsInApplication, fetchPlans]);

router.post("/:appAcronym/plans", [
  authorizedGroups(["PM"]),
  belongsInApplication,
  createPlan,
]);

//* Task
router.get("/:appAcronym/tasks", [belongsInApplication, fetchAllTasks]);
router.post("/:appAcronym/tasks", [
  authorizedGroups(["PL"]),
  belongsInApplication,
  createTask,
]);
router.put("/:appAcronym/tasks", [
  belongsInApplication,
  validateTaskChange,
  updateTask,
]);

export default router;
