const { OpenFgaApi } = require("@openfga/sdk");

const { FGA_TYPE, FGA_RELATIONSHIP } = require("./constants");
const { relationships } = require("./data-relationships");

const EXPENSES_STORE_NAME = "Expenses";

const EXPENSES_AUTHORISATION_MODEL = {
  "type_definitions": [
    {
      "type": FGA_TYPE.Expense,
      "relations": {
        [FGA_RELATIONSHIP.Submitter]: {
          "this": {}
        },
        [FGA_RELATIONSHIP.Approver]: {
          "tupleToUserset": {
            "tupleset": {
              "object": "",
              "relation": FGA_RELATIONSHIP.Submitter
            },
            "computedUserset": {
              "object": "",
              "relation": FGA_RELATIONSHIP.Manager
            }
          }
        },
        [FGA_RELATIONSHIP.Rejecter]: {
          "tupleToUserset": {
            "tupleset": {
              "object": "",
              "relation": FGA_RELATIONSHIP.Submitter
            },
            "computedUserset": {
              "object": "",
              "relation": FGA_RELATIONSHIP.Manager
            }
          }
        },
        [FGA_RELATIONSHIP.Viewer]: {
          "union": {
            "child": [
              {
                "this": {}
              },
              {
                "computedUserset": {
                  "object": "",
                  "relation": FGA_RELATIONSHIP.Submitter
                }
              },
              {
                "computedUserset": {
                  "object": "",
                  "relation": FGA_RELATIONSHIP.Approver
                }
              },
              {
                "computedUserset": {
                  "object": "",
                  "relation": FGA_RELATIONSHIP.Rejecter
                }
              }
            ]
          }
        }
      }
    },
    {
      "type": FGA_TYPE.Employee,
      "relations": {
        [FGA_RELATIONSHIP.Manager]: {
          "union": {
            "child": [
              {
                "this": {}
              },
              {
                "tupleToUserset": {
                  "tupleset": {
                    "object": "",
                    "relation": FGA_RELATIONSHIP.Manager
                  },
                  "computedUserset": {
                    "object": "",
                    "relation": FGA_RELATIONSHIP.Manager
                  }
                }
              }
            ]
          }
        }
      }
    }
  ]
};

let expensesStoreId;

function getOpenFgaApiClient() {
  const openFgaApiConfiguration = {
    apiScheme: process.env.FGA_API_SCHEME || "http",
    apiHost: process.env.FGA_API_HOST || "localhost:8080"
  };

  if (expensesStoreId) {
    openFgaApiConfiguration.storeId = expensesStoreId;
  }

  return new OpenFgaApi(openFgaApiConfiguration);
}

async function expensesStoreExists() {
  try {
    const { stores } = await getOpenFgaApiClient().listStores();
    for (const store of stores) {
      if (store.name === EXPENSES_STORE_NAME) {
        expensesStoreId = store.id;
        return true;
      }
    }
  } catch ( e ) {
    console.log(e);
  }

  return false;
};

async function createExpensesStore() {
  try {
    const { id } = await getOpenFgaApiClient().createStore({
      name: EXPENSES_STORE_NAME
    });
    expensesStoreId = id;
    return true;
  } catch ( e ) {
    console.log(e);
  }

  return false;
};

async function writeExpensesAuthorisationModel() {
  try {
    await getOpenFgaApiClient().writeAuthorizationModel(EXPENSES_AUTHORISATION_MODEL);
    return true;
  } catch ( e ) {
    console.log(e);
  }

  return false;
}

async function writeEmployeeExpenseRelationships() {
  try {
    await getOpenFgaApiClient().write({
      writes: {
        tuple_keys: relationships
      }
    });  
    return true;
  } catch ( e ) {
    console.log(e);
  }

  return false;
}

const initialiseExpensesStore = module.exports.initialiseExpensesStore = async function() {
  if (!await expensesStoreExists()) {
    if (await createExpensesStore()) {
      if (!await writeExpensesAuthorisationModel()) {
        console.log("Failed to create Expenses authorisation model in OpenFGA.");
        process.exit();
      }
    
      if (!await writeEmployeeExpenseRelationships()) {
        console.log("Failed to write employee expense relationships to OpenFGA.");
        process.exit();
      }    
    } else {
      console.log("Failed to create Expenses store in OpenFGA. Please make sure that OpenFGA is running.");
      process.exit();      
    }
  }
}

const userHasRelationshipWithObject = module.exports.userHasRelationshipWithObject = async function(user, relationship, object) {
  try {
    let { allowed } = await getOpenFgaApiClient().check({
      tuple_key: {
        user: user,
        relation: relationship,
        object: object
      }
    });
    return allowed;
  } catch ( e ) {
    console.log(e);
    return false;
  }
}