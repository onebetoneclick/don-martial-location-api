import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

app.use(cors());

app.use(express.json());

// General API request limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
});

app.use(limiter);

// ============================================
// TEST ROUTE
// ============================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Don Martial Location API is running 🚀"
    });
});

// ============================================
// LOCATION API ROUTES
// ============================================

import countriesRoute from "./routes/countries.js";
import statesRoute from "./routes/states.js";
import lgasRoute from "./routes/lgas.js";
import apiKeysRoute from "./routes/apiKeys.js";

import apiKey from "./middleware/apiKey.js";

app.use(
    "/api/v1/countries",
    apiKey,
    countriesRoute
);

app.use(
    "/api/v1/states",
    apiKey,
    statesRoute
);

app.use(
    "/api/v1/lgas",
    apiKey,
    lgasRoute
);

// ============================================
// API KEY ROUTE
// ============================================

app.use(
    "/api/v1/api-keys",
    apiKeysRoute
);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(
        `Don Martial Location API running on port ${PORT}`
    );
});
