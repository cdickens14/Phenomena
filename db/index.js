const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL || 'postgres://localhost:5432/phenomena_dev');

async function getOpenReports() {
  try {
    const { rows: reports } = await client.query(`
      SELECT *
      FROM reports
      WHERE reports."isOpen"='true';
    `);

    const { rows: comments } = await client.query(`
      SELECT *
      FROM comments
      WHERE "reportId" IN (${ 
        reports.map((report) => report.id).join(', ') });
    `);

    reports.forEach((report) => {
      delete report.password;
      report.isExpired = report.expirationDate < new Date();
      report.comments = comments.filter((comment) => comment.reportId === report.id);
    });
    
    return reports;

  } catch (error) {
    throw error;
  }
}

async function createReport(reportFields) {
  const { title, location, description, password } = reportFields;
  try {
    const { rows } = await client.query(`
      INSERT INTO reports(title, location, description, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [title, location, description, password]);

    delete rows[0].password;

    return rows[0];

  } catch (error) {
    throw error;
  }
}

async function _getReport(reportId) {
  try {
    const { rows: [report] } = await client.query(`
      SELECT *
      FROM reports
      WHERE id=${reportId};
    `)

    return report;

  } catch (error) {
    throw error;
  }
}

async function closeReport(reportId, password) {
  try {
   const report = await _getReport(reportId)
    if(!report) {
      throw Error("Report does not exist with that id");
    };
  
    if(report.password !== password) {
      throw Error("Password incorrect for this report, please try again");
    };

    if(report.isOpen === false) {
      throw Error("This report has already been closed");
    };
    
    const { rows } = await client.query(`
      UPDATE reports
      SET "isOpen"=false;
    `);

    return { message: "Report successfully closed!" };

  } catch (error) {
    throw error;
  }
}

async function createReportComment(reportId, commentFields) {
  const { content } = commentFields;
  const report = await _getReport(reportId);
  try {
    const { rows } = await client.query(`
    SELECT *
    FROM reports
    WHERE id=${reportId};
    `);
  
    if(!report) {
      throw Error("That report does not exist, no comment has been made");
    }

    if(!report.isOpen){
      throw Error("That report has been closed, no comment has been made");
    }

    if(Date.parse(report.expirationDate) < new Date()) {
      throw Error("The discussion time on this report has expired, no comment has been made");
    }

    const { rows: commentFields } = await client.query(`
      UPDATE reports
      SET "expirationDate" = CURRENT_TIMESTAMP + interval '1 day';
    `);

    return { content };

  } catch (error) {
    throw error;
  }
}

module.exports = {
  client, 
  createReport, 
  getOpenReports, 
  _getReport, 
  closeReport, 
  createReportComment
}