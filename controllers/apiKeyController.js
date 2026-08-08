import crypto from "crypto";
import { supabase } from "../config/supabase.js";

/*
|--------------------------------------------------------------------------
| Generate API Key
|--------------------------------------------------------------------------
| POST /api/v1/keys/generate
|--------------------------------------------------------------------------
*/

export const generateApiKey = async (req, res) => {
    try {
        // The authenticated user's UUID will eventually come from
        // the Supabase authentication middleware.
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check whether the user already has an active API key
        const { data: existingKey, error: existingError } =
            await supabase
                .from("api_keys")
                .select("id, api_key, plan, status, country_id, daily_limit")
                .eq("user_id", userId)
                .eq("status", "active")
                .maybeSingle();

        if (existingError) {
            console.error("Existing API key check error:", existingError);

            return res.status(500).json({
                success: false,
                message: "Unable to check existing API key"
            });
        }

        // Starter users are allowed one active API key
        if (existingKey) {
            return res.status(409).json({
                success: false,
                message: "You already have an active API key",
                api_key: {
                    id: existingKey.id,
                    key: maskApiKey(existingKey.api_key),
                    plan: existingKey.plan,
                    status: existingKey.status,
                    country_id: existingKey.country_id,
                    daily_limit: existingKey.daily_limit
                }
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Generate secure API key
        |--------------------------------------------------------------------------
        */

        const randomPart = crypto.randomBytes(32).toString("hex");

        const apiKey = `DM_live_${randomPart}`;

        /*
        |--------------------------------------------------------------------------
        | Starter plan
        |--------------------------------------------------------------------------
        */

        const plan = "starter";
        const dailyLimit = 100;

        /*
        |--------------------------------------------------------------------------
        | Insert API key
        |--------------------------------------------------------------------------
        */

        const { data, error } = await supabase
            .from("api_keys")
            .insert({
                user_id: userId,
                api_key: apiKey,
                plan: plan,
                status: "active",
                daily_limit: dailyLimit,
                requests_today: 0,
                last_request_date: new Date().toISOString().split("T")[0]
            })
            .select(
                "id, api_key, plan, status, country_id, daily_limit, requests_today, last_request_date, created_at"
            )
            .single();

        if (error) {
            console.error("API key creation error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create API key"
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Return key
        |--------------------------------------------------------------------------
        */

        return res.status(201).json({
            success: true,
            message: "API key created successfully",

            api_key: {
                id: data.id,
                key: data.api_key,
                plan: data.plan,
                status: data.status,
                country_id: data.country_id,
                daily_limit: data.daily_limit,
                requests_today: data.requests_today,
                remaining_today:
                    data.daily_limit - data.requests_today,
                created_at: data.created_at
            }
        });

    } catch (error) {
        console.error("Generate API key error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


/*
|--------------------------------------------------------------------------
| Mask API Key
|--------------------------------------------------------------------------
*/

function maskApiKey(key) {
    if (!key) {
        return null;
    }

    if (key.length <= 12) {
        return "••••••••";
    }

    return (
        key.substring(0, 8) +
        "••••••••••••••••" +
        key.substring(key.length - 4)
    );
}
