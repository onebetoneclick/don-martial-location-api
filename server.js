import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


// Security middleware
app.use(helmet());

app.use(cors());

app.use(express.json());


// API request limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
});

app.use(limiter);


// Test route
app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Don Martial Location API is running 🚀"
    });

});


// API routes (we will create these next)
import countriesRoute from "./routes/countries.js";
import statesRoute from "./routes/states.js";
import lgasRoute from "./routes/lgas.js";


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



app.listen(PORT, () => {

    console.log(
        `Don Martial Location API running on port ${PORT}`
    );

});
