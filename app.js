const express = require("express");
const redis = require("redis");
const axios = require("axios");

const app = express();
const redisClient = redis.createClient();


app.get("/noredis", async(req, res) => {
    let date = req.query.date;
    let fetch = await axios.get("https://covid19.ddc.moph.go.th/api/Cases/today-cases-by-provinces");
    let result = fetch.data;
    result ? res.json(result) : res.status(404).json({ result: "Not found" });
});



app.get("/redis/clear", async(req, res) => {
    redisClient.del("coviddata");
    res.json({ result: "ok" });
});


app.get("/redis", async(req, res) => {
    let date = req.query.date;
    redisClient.get("coviddata", async(error, data) => {
        if (error) {
            return res.status(500).send("Internal server error!");
        } else if (data) {
            data = JSON.parse(data);
            let result = data;
            return result ? res.json(result) : res.status(404).json({ result: "Not found!" });
        } else {
            let fetch = await axios.get(
                "https://covid19.ddc.moph.go.th/api/Cases/today-cases-by-provinces"
            );
            let get = fetch.data;
            // redisClient.set("coviddata", JSON.stringify(get));
            redisClient.setex("coviddata", 10, JSON.stringify(get));
            let result = get;
            return result ? res.json(result) : res.status(404).json({ result: "Not found!" });
        }
    });
});
app.listen(3000, () => {
    console.log("start in port 3000");
});