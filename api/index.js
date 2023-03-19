const express = require('express');
const router = express.Router();
const { getOpenReports, createReport, createReportComment, closeReport } = require('../db/index.js');

router.get('/reports', async(req, res, next) => {
    try {
        const reports = await getOpenReports();
        res.send({ reports });
    } catch (err) {
      next (err);
    }
});

router.post('/reports', async(req, res, next) => {
    try {
        const report = await createReport(req.body);
        res.send(report);
    } catch (err) {
      next (err);
    }
});

router.delete('/reports/:reportId', async(req, res, next) => {
    try {
        const report = await closeReport(req.params.reportId, req.body.password);
        res.send(report);
    } catch (err){
      next (err);
    }
});

router.post('/reports/:reportId/comments', async(req, res, next) => {
    try {
        const comment = await createReportComment(req.params.reportId, req.body);
        res.send(comment);
    } catch (err) {
      next (err);
    }
});

module.exports = {
    router
}