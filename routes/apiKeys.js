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

import express from "express";

import {
    generateApiKey
} from "../controllers/apiKeyController.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post(
    "/generate",
    requireAuth,
    generateApiKey
);

export default router;

export default router;
