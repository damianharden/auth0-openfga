const { EMPLOYEE_DETAIL, EXPENSE_STATUS, FGA_TYPE, FGA_RELATIONSHIP } = require("./constants");
const { userHasRelationshipWithObject } = require("./openfga-util");
const { expenses } = require("./data-expenses");

const employeeCanViewExpense = module.exports.employeeCanViewExpense = async function(employeeId, expense) {
  return await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Viewer, `${FGA_TYPE.Expense}:${expense.id}`);
}

/*
  If you want to update the employeeCanApproveExpense function so that a manager of a manager can
  override an expense rejection with an approval then:
  - Remove the current employeeCanApproveExpense function
  - Uncomment the updated employeeCanApproveExpense function below
  - Uncomment the "Uncomment" instructions in views/Expenses.js (search for "Uncomment" in that file)
*/
/*
const employeeCanApproveExpense = module.exports.employeeCanApproveExpense = async function(employeeId, expense) {
  if (expense.status === EXPENSE_STATUS.Submitted) {
    return await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Approver, `${FGA_TYPE.Expense}:${expense.id}`);
  } else if (expense.status === EXPENSE_STATUS.Rejected) {
    return await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Approver, `${FGA_TYPE.Expense}:${expense.id}`) &&
      await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Manager, `${FGA_TYPE.Employee}:${expense.rejecterId}`);
  } else {
    return false;
  }  
}
*/

const employeeCanApproveExpense = module.exports.employeeCanApproveExpense = async function(employeeId, expense) {
  return await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Approver, `${FGA_TYPE.Expense}:${expense.id}`);
}

/*
  If you want to update the employeeCanRejectExpense function so that a manager of a manager can
  override an expense approval with a rejection then:
  - Remove the current employeeCanRejectExpense function
  - Uncomment the updated employeeCanRejectExpense function below
  - Uncomment the "Uncomment" instructions in views/Expenses.js (search for "Uncomment" in that file)
*/
/*
const employeeCanRejectExpense = module.exports.employeeCanRejectExpense = async function(employeeId, expense) {
  if (expense.status === EXPENSE_STATUS.Submitted) {
    return await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Rejecter, `${FGA_TYPE.Expense}:${expense.id}`);
  } else if (expense.status === EXPENSE_STATUS.Approved) {
    return await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Rejecter, `${FGA_TYPE.Expense}:${expense.id}`) &&
      await userHasRelationshipWithObject(`${FGA_TYPE.Employee}:${employeeId}`, FGA_RELATIONSHIP.Manager, `${FGA_TYPE.Employee}:${expense.approverId}`);
  } else {
    return false;
  }
}
*/

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