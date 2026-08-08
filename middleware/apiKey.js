import supabase from "../config/supabase.js";

const apiKey = async (req, res, next) => {
    try {
        const clientKey = req.headers["x-api-key"];

        if (!clientKey) {
            return res.status(401).json({
                success: false,
                message: "API key is required"
            });
        }

        // Find API key in Supabase
        const { data: keyRecord, error } = await supabase
            .from("api_keys")
            .select("*")
            .eq("api_key", clientKey)
            .single();

        if (error || !keyRecord) {
            return res.status(403).json({
                success: false,
                message: "Invalid API key"
            });
        }

        // Check whether the key is active
        if (keyRecord.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "API key is inactive"
            });
        }

        // Reset daily counter when a new day starts
        const today = new Date().toISOString().split("T")[0];

        if (keyRecord.last_request_date !== today) {
            const { data: resetKey, error: resetError } = await supabase
                .from("api_keys")
                .update({
                    requests_today: 0,
                    last_request_date: today,
                    updated_at: new Date().toISOString()
                })
                .eq("id", keyRecord.id)
                .select()
                .single();

            if (resetError) {
                console.error("Daily reset error:", resetError);

                return res.status(500).json({
                    success: false,
                    message: "Unable to reset daily API limit"
                });
            }

            keyRecord.requests_today = 0;
            keyRecord.last_request_date = today;
        }

        // Check daily limit
        if (keyRecord.requests_today >= keyRecord.daily_limit) {
            return res.status(429).json({
                success: false,
                message: "Daily API request limit reached",
                limit: keyRecord.daily_limit,
                used: keyRecord.requests_today,
                remaining: 0,
                reset: "next day"
            });
        }

        // Count this request
        const newRequestCount = keyRecord.requests_today + 1;

        const { error: updateError } = await supabase
            .from("api_keys")
            .update({
                requests_today: newRequestCount,
                updated_at: new Date().toISOString()
            })
            .eq("id", keyRecord.id);

        if (updateError) {
            console.error("API usage update error:", updateError);

            return res.status(500).json({
                success: false,
                message: "Unable to update API usage"
            });
        }

        // Attach API-key information to request
        req.apiKey = keyRecord;

        req.apiKey.requests_today = newRequestCount;

        next();

    } catch (error) {
        console.error("API key middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "API key verification failed"
        });
    }
};

export default apiKey;
