import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Empty initial data
const emptyFriends = [];
const emptyGroups = [];
const emptyExpenses = [];

// Categories with their colors (keep these as they're needed for the UI)
const expenseCategories = [
  { id: 'Food & Drink', name: 'Food & Drink', color: '#FF9F1C' },
  { id: 'Utilities', name: 'Utilities', color: '#2EC4B6' },
  { id: 'Transportation', name: 'Transportation', color: '#E71D36' },
  { id: 'Entertainment', name: 'Entertainment', color: '#7209B7' },
  { id: 'Travel', name: 'Travel', color: '#3A86FF' },
  { id: 'Shopping', name: 'Shopping', color: '#8338EC' },
  { id: 'Rent', name: 'Rent', color: '#FB5607' },
  { id: 'Other', name: 'Other', color: '#868B8E' },
];

export const AppProvider = ({ children }) => {
  const [friends, setFriends] = useState(emptyFriends);
  const [groups, setGroups] = useState(emptyGroups);
  const [expenses, setExpenses] = useState(emptyExpenses);
  const [balances, setBalances] = useState({});
  
  // Calculate balances between people
  useEffect(() => {
    const calculatedBalances = {};
    
    // Initialize all balances to 0
    friends.forEach(person => {
      calculatedBalances[person.id] = {};
      
      friends.forEach(otherPerson => {
        if (person.id !== otherPerson.id) {
          calculatedBalances[person.id][otherPerson.id] = 0;
        }
      });
    });
    
    // For each expense, calculate what others owe the payer
    expenses.forEach(expense => {
      const payer = expense.paidBy;
      const isPercentageSplit = expense.splitOption === 'percentage' && expense.exactAmounts;
      
      // Get amount per person - either equal split or percentage based
      expense.splitAmong.forEach(personId => {
        if (personId !== payer) {
          // Calculate how much each person owes to payer
          if (!calculatedBalances[personId]) calculatedBalances[personId] = {};
          if (!calculatedBalances[payer]) calculatedBalances[payer] = {};
          
          let amountOwed;
          
          if (isPercentageSplit) {
            // Use exact amount from percentage split
            amountOwed = expense.exactAmounts[personId] || 0;
          } else {
            // Default to equal split
            const splitCount = expense.splitAmong.length;
            amountOwed = expense.amount / splitCount;
          }
          
          calculatedBalances[personId][payer] = (calculatedBalances[personId][payer] || 0) - amountOwed;
          calculatedBalances[payer][personId] = (calculatedBalances[payer][personId] || 0) + amountOwed;
        }
      });
    });
    
    setBalances(calculatedBalances);
  }, [expenses, friends]);
  
  // Add a new expense
  const addExpense = (newExpense) => {
    const expenseWithId = {
      ...newExpense,
      id: expenses.length + 1,
      date: new Date(newExpense.date)
    };
    setExpenses([...expenses, expenseWithId]);
  };
  
  // Remove an expense by id
  const removeExpense = (expenseId) => {
    setExpenses(expenses.filter(expense => expense.id !== expenseId));
  };
  
  // Add a new person
  const addFriend = (name) => {
    const nextId = friends.length > 0 ? Math.max(...friends.map(f => f.id)) + 1 : 1;
    const newFriend = {
      id: nextId,
      name: name,
      email: `${name.toLowerCase()}@example.com`,
      avatar: '',
    };
    setFriends([...friends, newFriend]);
  };
  
  // Remove a person
  const removeFriend = (friendId) => {
    // Don't allow removing people who are involved in expenses
    const isInvolved = expenses.some(expense => 
      expense.paidBy === friendId || 
      expense.splitAmong.includes(friendId)
    );
    
    if (!isInvolved) {
      setFriends(friends.filter(friend => friend.id !== friendId));
    }
    
    return !isInvolved; // Return success status
  };
  
  // Add a new group
  const addGroup = (newGroup) => {
    const groupWithId = {
      ...newGroup,
      id: groups.length + 1,
      total: 0
    };
    setGroups([...groups, groupWithId]);
  };
  
  // Reset all data
  const resetAll = () => {
    setFriends(emptyFriends);
    setGroups(emptyGroups);
    setExpenses(emptyExpenses);
    setBalances({});
  };
  
  // Get friend by id
  const getFriend = (id) => {
    return friends.find(friend => friend.id === id);
  };
  
  // Get group by id
  const getGroup = (id) => {
    return groups.find(group => group.id === id);
  };
  
  // Get expenses for a specific group
  const getGroupExpenses = (groupId) => {
    return expenses.filter(expense => expense.group === groupId);
  };
  
  // Get all expenses involving a specific friend
  const getFriendExpenses = (friendId) => {
    return expenses.filter(expense => 
      expense.paidBy === friendId || 
      expense.splitAmong.includes(friendId)
    );
  };
  
  return (
    <AppContext.Provider
      value={{
        friends,
        groups,
        expenses,
        balances,
        expenseCategories,
        addExpense,
        removeExpense,
        addFriend,
        removeFriend,
        addGroup,
        resetAll,
        getFriend,
        getGroup,
        getGroupExpenses,
        getFriendExpenses,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};