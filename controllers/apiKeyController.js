import crypto from "crypto";
import { supabase } from "../config/supabase.js";

export const generateApiKey = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check if this user already has an active API key
        const { data: existingKey, error: existingError } =
            await supabase
                .from("api_keys")
                .select(`
                    id,
                    api_key,
                    plan,
                    status,
                    country_id,
                    daily_limit,
                    requests_today,
                    last_request_date,
                    created_at
                `)
                .eq("user_id", userId)
                .eq("status", "active")
                .maybeSingle();

        if (existingError) {
            console.error(
                "Existing API key check error:",
                existingError
            );

            return res.status(500).json({
                success: false,
                message: "Unable to check existing API key"
            });
        }

        // One active Starter key per user
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
                    daily_limit: existingKey.daily_limit,
                    requests_today: existingKey.requests_today,
                    remaining:
                        Math.max(
                            0,
                            existingKey.daily_limit -
                            existingKey.requests_today
                        ),
                    created_at: existingKey.created_at
                }
            });
        }

        // Generate secure random key
        const randomPart = crypto
            .randomBytes(32)
            .toString("hex");

        const apiKey = `DM_live_${randomPart}`;

        // Starter plan
        const plan = "starter";
        const dailyLimit = 100;

        // Create API key
        const { data, error } = await supabase
            .from("api_keys")
            .insert({
                user_id: userId,
                api_key: apiKey,
                plan: plan,
                status: "active",
                daily_limit: dailyLimit,
                requests_today: 0,
                last_request_date:
                    new Date().toISOString().split("T")[0]
            })
            .select(`
                id,
                api_key,
                plan,
                status,
                country_id,
                daily_limit,
                requests_today,
                last_request_date,
                created_at
            `)
            .single();

        if (error) {
            console.error(
                "API key creation error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to create API key",
                error: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "API key created successfully",

            api_key: {
                id: data.id,
                key: data.api_key,
                plan: data.plan,
                status: data.status,

                // Country will be assigned later
                // during onboarding.
                country_id: data.country_id,

                daily_limit: data.daily_limit,
                requests_today: data.requests_today,

                remaining:
                    data.daily_limit -
                    data.requests_today,

                last_request_date:
                    data.last_request_date,

                created_at:
                    data.created_at
            }
        });

    } catch (error) {
        console.error(
            "Generate API key error:",
            error
        );

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
