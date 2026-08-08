import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();


// Get LGAs by state
// Example: /api/v1/lgas?state=Lagos

router.get("/", async (req, res)=>{


    try {


        const { state } = req.query;



        if(!state){

            return res.status(400).json({

                success:false,
                message:"State name is required"

            });

        }



        const { data, error } = await supabase
            .from("lgas")
            .select(`
                id,
                name,
                headquarters,
                states!inner(
                    name,
                    countries!inner(
                        name,
                        iso2
                    )
                )
            `)
            .eq("states.name", state)
            .order("name",{ascending:true});




        if(error){

            return res.status(500).json({

                success:false,
                message:error.message

            });

        }




        res.json({

            success:true,
            state,
            count:data.length,
            data

        });



    }catch(error){


        res.status(500).json({

            success:false,
            message:error.message

        });


    }


});



export default router;
