const EMPLOYEE_ID = module.exports.EMPLOYEE_ID = {
  Sam: "sam",
  Daniel: "daniel",
  Matt: "matt",
  Peter: "peter"
};

const EMPLOYEE_DETAIL = module.exports.EMPLOYEE_DETAIL = {
  [EMPLOYEE_ID.Sam]: {
    name: "Sam"
  },
  [EMPLOYEE_ID.Daniel]: {
    name: "Daniel"
  },
  [EMPLOYEE_ID.Matt]: {
    name: "Matt"
  },
  [EMPLOYEE_ID.Peter]: {
    name: "Peter"
  }
};

const EXPENSE_STATUS = module.exports.EXPENSE_STATUS = {
  Submitted: "Submitted",
  Approved: "Approved",
  Rejected: "Rejected"
};

const FGA_TYPE = module.exports.FGA_TYPE = {
  Expense: "expense",
  Employee: "employee"
};

const FGA_RELATIONSHIP = module.exports.FGA_RELATIONSHIP = {
  Submitter: "submitter",
  Approver: "approver",
  Rejecter: "rejecter",
  Viewer: "viewer",
  Manager: "manager"
};