import express from "express";
import {
    generateApiKey
} from "../controllers/apiKeyController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Generate API Key
|--------------------------------------------------------------------------
| POST /api/v1/keys/generate
|
| Creates a new Starter API key for the authenticated user.
|--------------------------------------------------------------------------
*/

router.post("/generate", generateApiKey);

export default router;
