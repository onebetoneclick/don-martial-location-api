import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();


// Get all countries
router.get("/", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("countries")
            .select("*")
            .order("name", { ascending: true });


        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }


        res.json({
            success: true,
            count: data.length,
            data
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


export default router;
