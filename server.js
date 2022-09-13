const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth }  = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");

const { initialiseExpensesStore } = require("./openfga-util");
const { getExpense, approveExpenseByEmployee, rejectExpenseByEmployee } = require("./data-expenses");
const { listRelatedExpensesForEmployee, employeeCanApproveExpense, employeeCanRejectExpense } = require("./openfga-rebac");
const e = require("express");

(async() => {
  initialiseExpensesStore();
  
  const app = express();
  
  const port = process.env.API_PORT || 3101;
  const appPort = process.env.SERVER_PORT || 3100;
  const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;
  
  if (
    !authConfig.domain ||
    !authConfig.audience ||
    authConfig.audience === "YOUR_API_IDENTIFIER"
  ) {
    console.log("Please make sure that auth_config.json is in place and populated with valid domain and audience values");  
    process.exit();
  }
  
  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors({ origin: appOrigin }));
  
  const checkJwt = auth({
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  });

  app.get("/api/v1/expenses", checkJwt, async (req, res) => {
    let employeeId = req.auth.payload.employee_id;
    res.send(await listRelatedExpensesForEmployee(employeeId));
  });

  app.post("/api/v1/expenses/:expenseId/approve", checkJwt, async (req, res) => {
    let employeeId = req.auth.payload.employee_id;
    let expense = getExpense(req.params.expenseId);
    if (expense) {
      if (await employeeCanApproveExpense(employeeId, expense)) {
        approveExpenseByEmployee(expense.id, employeeId);
        res.send(await listRelatedExpensesForEmployee(employeeId));  
      } else {
        res.status(403).send();
      }
    } else {
      res.status(404).send();
    }
  });

  app.post("/api/v1/expenses/:expenseId/reject", checkJwt, async (req, res) => {
    let employeeId = req.auth.payload.employee_id;
    let expense = getExpense(req.params.expenseId);
    if (expense) {
      if (await employeeCanRejectExpense(employeeId, expense)) {
        rejectExpenseByEmployee(expense.id, employeeId);
        res.send(await listRelatedExpensesForEmployee(employeeId));  
      } else {
        res.status(403).send();
      }
    } else {
      res.status(404).send();
    }    
  });
  
  app.listen(port, () => console.log(`API Server listening on port ${port}`));  
})();