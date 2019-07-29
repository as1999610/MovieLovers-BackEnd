import express from "express";
import request from "request-promise";
import { parseString } from "xml2js";
import authenticate from "../middlewares/authenticate";
import Movie from "../models/Movie";
import parseErrors from "../utils/parseErrors";

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  Movie.find({ userId: req.currentUser._id }).then(movies => res.json({ movies }));
});

router.post("/", (req, res) => {
  Movie.create({ ...req.body.movie, userId: req.currentUser._id })
    .then(movie => res.json({ movie }))
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.get("/search", (req, res) => {
  request
    .get(
      `https://www.goodwatch.com/search/index.xml?key=${process.env
        .GOODWATCH_KEY}&q=${req.query.q}`
    )
    .then(result =>
      parseString(result, (err, goodwatchResult) =>
        res.json({
          movies: goodwatchResult.GoodwatchResponse.search[0].results[0].work.map(
            work => ({
              goodwatchId: work.best_movie[0].id[0]._,
              title: work.best_movie[0].title[0],
              director: work.best_movie[0].director[0].name[0],
              mainActor: [work.best_movie[0].image_url[0]]
            })
          )
        })
      )
    );
});

router.get("/fetchPages", (req, res) => {
  const goodwatchId = req.query.goodwatchId;

  request
    .get(
      `https://www.goodwatch.com/movie/show.xml?key=${process.env
        .GOODWATCH_KEY}&id=${goodwatchId}`
    )
    .then(result =>
      parseString(result, (err, goodwatchResult) => {
        const duration = goodwatchResult.GoodwatchResponse.movie[0].duration[0];
        const durations = duration ? parseInt(duration, 10) : 0;
        res.json({
          duration
        });
      })
    );
});

export default router;
