const { EMPLOYEE_DETAIL, EXPENSE_STATUS, FGA_TYPE, FGA_RELATIONSHIP } = require("./constants");
const { userHasRelationshipWithObject } = require("./openfga-util");
const { expenses } = require("./data-expenses");

const employeeCanViewExpense = module.exports.employeeCanViewExpense = async function(employeeId, expense) {
  return await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Viewer, `${FGA_TYPE.Expense}:${expense.id}`);
}

const employeeCanApproveExpense = module.exports.employeeCanApproveExpense = async function(employeeId, expense) {
  return await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Approver, `${FGA_TYPE.Expense}:${expense.id}`);
}

const employeeCanRejectExpense = module.exports.employeeCanRejectExpense = async function(employeeId, expense) {
  return await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Rejecter, `${FGA_TYPE.Expense}:${expense.id}`);
}

const listRelatedExpensesForEmployee = module.exports.listRelatedExpensesForEmployee = async function(employeeId) {
  let relatedExpenses = {
    submitted: [],
    sharedWithMe: [],
    awaitingAction: [],
    completed: []
  }

  for (const expense of expenses) {
    let expenseSubmitter = EMPLOYEE_DETAIL[expense.submitterId];
    let expenseSummary = {
      id: expense.id,
      date: expense.date,
      submitter: expenseSubmitter.name,
      status: expense.status,
      amount: expense.amount,
      description: expense.description
    };

    if (expense.status !== EXPENSE_STATUS.Submitted) {
      let expenseActionerId = expense.status === EXPENSE_STATUS.Approved ? expense.approverId : expense.rejecterId;
      if (expenseActionerId === employeeId) {
        expenseSummary.status += ' by me'
      } else {
        let expenseActioner = EMPLOYEE_DETAIL[expenseActionerId];
        expenseSummary.status += ` by ${expenseActioner.name}`;
      }
    }

    if (expense.submitterId === employeeId) {
      if (expense.status === EXPENSE_STATUS.Submitted) {
        relatedExpenses.submitted.push(expenseSummary);
      } else {
        relatedExpenses.completed.push(expenseSummary);
      }
    } else {
      expenseSummary.canApprove = await employeeCanApproveExpense(employeeId, expense);
      expenseSummary.canReject = await employeeCanRejectExpense(employeeId, expense);

      if (expenseSummary.canApprove || expenseSummary.canReject) {
        if (expense.status === EXPENSE_STATUS.Submitted) {
          relatedExpenses.awaitingAction.push(expenseSummary);
        } else {
          relatedExpenses.completed.push(expenseSummary);
        }
      } else if (expense.actionerIds.includes(employeeId)) {
        relatedExpenses.completed.push(expenseSummary);
      } else if (await employeeCanViewExpense(employeeId, expense)) {
        relatedExpenses.sharedWithMe.push(expenseSummary);
      }
    }
  }

  return relatedExpenses;
}