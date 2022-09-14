import React, { useState, useEffect } from "react";
import { Button, Alert } from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
import "./Expenses.css"

export const ExpensesComponent = () => {
  const { apiOrigin = "http://localhost:3101" } = getConfig();

  const [state, setState] = useState({
    showResult: false,
    expenses: {},
    error: null,
  });

  useEffect(() => {
    callApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  

  const {
    getAccessTokenSilently
  } = useAuth0();

  const getAccessTokenSilentlyAndLogInspectionUrl = async () => {
    const token = await getAccessTokenSilently();
    console.log(`Access token inspection via jwt.io: https://jwt.io/#access_token=${token}`);
    return token;
  }

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilentlyAndLogInspectionUrl();

      const response = await fetch(`${apiOrigin}/api/v1/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const relatedExpenses = await response.json();

      setState({
        ...state,
        showResult: true,
        expenses: relatedExpenses,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  const approve = async (expenseId) => {
    try {
      const token = await getAccessTokenSilentlyAndLogInspectionUrl();

      const response = await fetch(`${apiOrigin}/api/v1/expenses/${expenseId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const relatedExpenses = await response.json();

      setState({
        ...state,
        showResult: true,
        expenses: relatedExpenses,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  const reject = async (expenseId) => {
    try {
      const token = await getAccessTokenSilentlyAndLogInspectionUrl();

      const response = await fetch(`${apiOrigin}/api/v1/expenses/${expenseId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const relatedExpenses = await response.json();

      setState({
        ...state,
        showResult: true,
        expenses: relatedExpenses,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  return (
    <>
      <div className="mb-5">
        {state.error && (
          <Alert color="warning">
            Error: {state.error}
          </Alert>
        )}

        <h1>Expenses</h1>

      </div>
      
      {state.showResult && (state.expenses.submitted.length > 0) && (
        <div className="result-block-container">
          <h2>Submitted</h2>
          <div className="row-header">
            <div className="date">Date</div>
            <div className="description">Description</div>
            <div className="amount">Amount</div>
          </div>
        {state.expenses.submitted.map((expense, index) => {
          return <div key={index} className="expense">
            <div className="date">{expense.date}</div>
            <div className="description">{expense.description}</div>
            <div className="amount">${expense.amount}</div>
          </div>
        })}
        </div>
      )}
      
      {state.showResult && (state.expenses.sharedWithMe.length > 0) && (
        <div className="result-block-container">
          <h2>Shared with me</h2>
          <div className="row-header">
            <div className="date">Date</div>
            <div className="submitter">Submitter</div>
            <div className="description">Description</div>
            <div className="amount">Amount</div>
            <div className="status">Status</div>
          </div>
        {state.expenses.sharedWithMe.map((expense, index) => {
          return <div key={index} className="expense">
            <div className="date">{expense.date}</div>
            <div className="submitter">{expense.submitter}</div>
            <div className="description">{expense.description}</div>
            <div className="amount">${expense.amount}</div>
            <div className="status">{expense.status}</div>
          </div>
        })}
        </div>
      )}
      
      {state.showResult && (state.expenses.awaitingAction.length > 0) && (
        <div className="result-block-container">
          <h2>Awaiting action</h2>
          <div className="row-header">
            <div className="date">Date</div>
            <div className="submitter">Submitter</div>
            <div className="description">Description</div>
            <div className="amount">Amount</div>
            <div className="actions">Actions</div>
          </div>
        {state.expenses.awaitingAction.map((expense, index) => {
          return <div key={index} className="expense">
            <div className="date">{expense.date}</div>
            <div className="submitter">{expense.submitter}</div>
            <div className="description">{expense.description}</div>
            <div className="amount">${expense.amount}</div>
            <div className="actions">
              { expense.canApprove && (<Button color="success" onClick={() => approve(expense.id)}>Approve</Button>)}
              { expense.canReject && (<Button color="danger" onClick={() => reject(expense.id)}>Reject</Button>)}        
            </div>
          </div>
        })}
        </div>
      )}
      
      {state.showResult && (state.expenses.completed.length > 0) && (
        <div className="result-block-container">
          <h2>Completed</h2>
          <div className="row-header">
            <div className="date">Date</div>
            <div className="submitter">Submitter</div>
            <div className="description">Description</div>
            <div className="amount">Amount</div>
            <div className="status">Status</div>
            {/* Uncomment the below HTML - remove lines 197 and 199 (line 198 if you remove line 199) - if instructed to do so */}
            {/* 
            <div className="actions">&nbsp;</div>
            */}
          </div>
        {state.expenses.completed.map((expense, index) => {
          return <div key={index} className="expense">
            <div className="date">{expense.date}</div>
            <div className="submitter">{expense.submitter}</div>
            <div className="description">{expense.description}</div>
            <div className="amount">${expense.amount}</div>
            <div className="status">{expense.status}</div>
            {/* Uncomment the below HTML - remove lines 209 and 214 (line 213 if you remove line 209) - if instructed to do so */}
            {/*
            <div className="actions">
              { expense.canApprove && (<Button color="success" onClick={() => approve(expense.id)}>Approve</Button>)}
              { expense.canReject && (<Button color="danger" onClick={() => reject(expense.id)}>Reject</Button>)}        
            </div>            
            */}
          </div>
        })}
        </div>
      )}      
    </>
  );
};

export default withAuthenticationRequired(ExpensesComponent, {
  onRedirecting: () => <Loading />,
});
