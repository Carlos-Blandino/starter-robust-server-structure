const express = require("express");
const app = express();

// TODO: Follow instructions in the checkpoint to implement ths API.
const counts = require("./data/count-data");
const flips = require("./data/flip-data");
app.use(express.json())

app.use("/flips/:flipId", (req, res, next) => {
  const { flipId } = req.params;
  const foundFlip = flips.find((flip) => flip.id === Number(flipId));

  if (foundFlip) {
    res.json({ data: foundFlip });
  } else {
    next(`Flip id not found: ${flipId}`);
  }
});

app.use("/counts/:countId", (req, res, next) => {
  const { countId } = req.params;
  const foundCount = counts[countId];

  if (foundCount === undefined) {
    next(`Count id not found: ${countId}`);
  } else {
    res.json({ data: foundCount }); // Return a JSON object, not a number.
  }
});

app.use("/counts", (req, res) => {
  res.json({ data: counts });
});

app.get("/flips", (req, res)=>{
  res.json({data:flips});
})
// Variable to hold the next id.
// Since some ID's may already be used, you find the largest assigned id.
let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0);

function bodyHasResultProperty(req,res,next){
const { data: { result } = {} } = req.body;
  if (result) {
    return next();
  }
    next({status: 400, message: "A 'result' property is required",});
  
}

app.post("/flips", bodyHasResultProperty,(req, res, next) => {
  const { data: { result } = {} } = req.body;
  const newFlip = {
    id: ++lastFlipId, // Increment last id then assign as the current ID
    result,
  };
  flips.push(newFlip);
  counts[result] = counts[result] + 1; // Increment the counts
  //res.json({ data: newFlip });
  res.status(201).json({ data: newFlip });
}
);

// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, request, response, next) => {
  const { status = 500, message = "Something went wrong!"} = error;
  response.status(status).json({error: message});
});

module.exports = app;
