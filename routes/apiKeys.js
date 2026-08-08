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
