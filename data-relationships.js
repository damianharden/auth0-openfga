const { EMPLOYEE_ID, FGA_TYPE, FGA_RELATIONSHIP } = require("./constants");
const { expenses } = require("./data-expenses");

let relationships = module.exports.relationships = [
  {
    "user": `${FGA_TYPE.Employee}:${EMPLOYEE_ID.Daniel}`,
    "relation": FGA_RELATIONSHIP.Manager,
    "object": `${FGA_TYPE.Employee}:${EMPLOYEE_ID.Sam}`
  },        
  {
    "user": `${FGA_TYPE.Employee}:${EMPLOYEE_ID.Matt}`,
    "relation": FGA_RELATIONSHIP.Manager,
    "object": `${FGA_TYPE.Employee}:${EMPLOYEE_ID.Daniel}`
  }
];

// Assign submitter relationship to expenses
for (const expense of expenses) {
  relationships.push(
    {
      "user": `${FGA_TYPE.Employee}:${expense.submitterId}`,
      "relation": FGA_RELATIONSHIP.Submitter,
      "object": `${FGA_TYPE.Expense}:${expense.id}`
    }
  );
}

// Make Peter a viewer of all of Sam's expenses
for (const expense of expenses) {
  if (expense.submitterId == EMPLOYEE_ID.Sam) {
    relationships.push(
      {
        "user": `${FGA_TYPE.Employee}:${EMPLOYEE_ID.Peter}`,
        "relation": FGA_RELATIONSHIP.Viewer,
        "object": `${FGA_TYPE.Expense}:${expense.id}`
      }
    );
  }
}