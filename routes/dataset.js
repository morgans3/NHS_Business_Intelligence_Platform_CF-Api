// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const NDXfilter = require("../models/crossfilter").filterCF;
const CF = require("../models/crossfilter");

/**
 * @swagger
 * tags:
 *   name: Dataset
 *   description: Stats for the Dataset
 */

/**
 * @swagger
 * /dataset/getCrossfilter:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Queries the Server Side Crossfilter Object
 *     tags:
 *      - Dataset
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getCrossfilter",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const filter = req.params["filter"] ? JSON.parse(req.params["filter"]) : {};
    NDXfilter(filter, (cf, err) => {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        res.status(200).send(cf);
      }
    });
  }
);

/**
 * @swagger
 * /dataset/rebuildCrossfilter:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Builds the Server Side Crossfilter Object
 *     tags:
 *      - Dataset
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/rebuildCrossfilter",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    CF.buildCrossfilter((err, result) => {
      if (err) {
        res.status(400).json({
          success: false,
          msg: err,
        });
      } else {
        res.status(200).json({
          success: true,
          msg: result,
        });
      }
    });
  }
);

/**
 * @swagger
 * /dataset/getComparison:
 *   post:
 *     consumes:
 *      - application/json
 *     security:
 *      - JWT: []
 *     tags:
 *      - Dataset
 *     parameters:
 *       - name: cohorts
 *         description: Cohort A and Cohort B
 *         in: body
 *         required: true
 *         schema:
 *          type: object
 *          properties:
 *             cohorta:
 *                type: object
 *                properties:
 *                  username:
 *                    type: string
 *                  cohortName:
 *                    type: string
 *                  cohorturl:
 *                    type: string
 *                  createdDT:
 *                    type: string
 *             cohortb:
 *                type: object
 *                properties:
 *                  username:
 *                    type: string
 *                  cohortName:
 *                    type: string
 *                  cohorturl:
 *                    type: string
 *                  createdDT:
 *                    type: string
 *     description: Builds the comparison table
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.post(
  "/getComparison",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const cohortBaselineFilter = req.body.cohorta;
    const cohortComparatorFilter = req.body.cohortb;
    if (cohortBaselineFilter.cohorturl && cohortComparatorFilter.cohorturl) {
      const a = JSON.parse(cohortBaselineFilter.cohorturl);
      const b = JSON.parse(cohortComparatorFilter.cohorturl);
      CF.compareCF(a, b, function (cf, baseline, comp, err) {
        if (err) {
          console.error(err);
          res.status(500).send({ err: "Problem calculating comparison: " + err });
        } else {
          res.status(200).send({
            details: cf,
            baselinePop: baseline,
            comparisonPop: comp,
          });
        }
      });
    } else {
      res.status(400).send({
        err: "No cohorts provided",
      });
    }
  }
);

module.exports = router;