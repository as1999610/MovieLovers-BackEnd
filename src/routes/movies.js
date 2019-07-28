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
      `https://www.goodreads.com/search/index.xml?key=${process.env
        .GOODREADS_KEY}&q=${req.query.q}`
    )
    .then(result =>
      parseString(result, (err, goodreadsResult) =>
        res.json({
          movies: goodreadsResult.GoodreadsResponse.search[0].results[0].work.map(
            work => ({
              goodreadsId: work.best_movie[0].id[0]._,
              title: work.best_movie[0].title[0],
              authors: work.best_movie[0].author[0].name[0],
              covers: [work.best_movie[0].image_url[0]]
            })
          )
        })
      )
    );
});

router.get("/fetchPages", (req, res) => {
  const goodreadsId = req.query.goodreadsId;

  request
    .get(
      `https://www.goodreads.com/book/show.xml?key=${process.env
        .GOODREADS_KEY}&id=${goodreadsId}`
    )
    .then(result =>
      parseString(result, (err, goodreadsResult) => {
        const numPages = goodreadsResult.GoodreadsResponse.movie[0].num_pages[0];
        const pages = numPages ? parseInt(numPages, 10) : 0;
        res.json({
          pages
        });
      })
    );
});

export default router;
