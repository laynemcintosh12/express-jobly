"use strict";

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });

/**
 * Create a new job and return the job data.
 *
 * @function
 * @name POST /jobs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - { job: { id, title, salary, equity, companyHandle } }
 * @throws {BadRequestError} - If request data is invalid
 * @throws {Error} - If an unexpected error occurs
 * @middleware ensureAdmin - Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/**
 * Get a list of jobs based on optional search filters.
 *
 * @function
 * @name GET /jobs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - { jobs: [{ id, title, salary, equity, companyHandle, companyName }, ...] }
 * @throws {BadRequestError} - If request data is invalid
 * @throws {Error} - If an unexpected error occurs
 * @middleware none - Authorization required: none
 */
router.get("/", async function (req, res, next) {
  const q = req.query;
  // arrive as strings from querystring, but we want as int/bool
  if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
  q.hasEquity = q.hasEquity === "true";

  try {
    const validator = jsonschema.validate(q, jobSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const jobs = await Job.findAll(q);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/**
 * Get details about a specific job.
 *
 * @function
 * @name GET /jobs/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - { job: { id, title, salary, equity, company } }
 * @throws {Error} - If an unexpected error occurs
 * @middleware none - Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/**
 * Update a job and return the updated job data.
 *
 * @function
 * @name PATCH /jobs/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - { job: { id, title, salary, equity, companyHandle } }
 * @throws {BadRequestError} - If request data is invalid
 * @throws {Error} - If an unexpected error occurs
 * @middleware ensureAdmin - Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/**
 * Delete a job and return the ID of the deleted job.
 *
 * @function
 * @name DELETE /jobs/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - { deleted: id }
 * @throws {Error} - If an unexpected error occurs
 * @middleware ensureAdmin - Authorization required: admin
 */
router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
