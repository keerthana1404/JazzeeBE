import express from "express"
import{isAuthenticated,isAutherised} from "../middlewares/auth.js"
import { deleteApplication, employerGetAllApplication, jobSeekerGetAllApplication, postApplication } from "../controllers/applicationController.js";


const router = express.Router();

router.post("/post/:id",isAuthenticated,isAutherised("job seeker"),postApplication);
router.get("/employer/getall",isAuthenticated,isAutherised("employer"),employerGetAllApplication);
router.get("/jobseeker/getall",isAuthenticated,isAutherised("job seeker"),jobSeekerGetAllApplication);
router.delete("/delete/:id",isAuthenticated,deleteApplication);

export default router;
