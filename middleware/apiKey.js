const apiKey = (req, res, next) => {

    const clientKey = req.headers["x-api-key"];

    const validKey = process.env.API_KEY;


    if (!clientKey) {

        return res.status(401).json({

            success: false,
            message: "API key is required"

        });

    }


    if (clientKey !== validKey) {

        return res.status(403).json({

            success: false,
            message: "Invalid API key"

        });

    }


    next();

};


export default apiKey;
