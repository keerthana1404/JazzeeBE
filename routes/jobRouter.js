import express from "express"
import { isAuthenticated,isAutherised } from "../middlewares/auth.js";
import { postJob,getAllJobs,getMyJobs,getASingleJob,deleteJob } from "../controllers/jobController.js";

const router = express.Router();

router.post("/post",isAuthenticated,isAutherised("employer"),postJob);
router.get("/getall",getAllJobs);
router.get("/getmyjobs",isAuthenticated,isAutherised("employer"),getMyJobs);
router.delete("/delete/:id",isAuthenticated,isAutherised("employer"),deleteJob);
router.get("/get/:id",isAuthenticated,getASingleJob);

export default router