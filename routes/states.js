import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();


// Get states by country ISO2
// Example: /api/v1/states?country=NG

router.get("/", async (req, res) => {

    try {

        const { country } = req.query;


        if (!country) {

            return res.status(400).json({
                success: false,
                message: "Country code is required"
            });

        }


        const { data, error } = await supabase
            .from("states")
            .select(`
                id,
                name,
                country_id,
                countries!inner(
                    name,
                    iso2
                )
            `)
            .eq("countries.iso2", country.toUpperCase())
            .order("name", { ascending: true });



        if (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }



        res.json({

            success: true,
            country,
            count: data.length,
            data

        });



    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

});


export default router;
