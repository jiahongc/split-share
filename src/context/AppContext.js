import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

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

const loadFromStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const nextId = (items) => items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

export const AppProvider = ({ children }) => {
  const [friends, setFriends] = useState(() => loadFromStorage('splitshare-friends', []));
  const [groups, setGroups] = useState(() => loadFromStorage('splitshare-groups', []));
  const [expenses, setExpenses] = useState(() => {
    const stored = loadFromStorage('splitshare-expenses', []);
    // Re-hydrate dates from strings
    return stored.map(e => ({ ...e, date: new Date(e.date) }));
  });
  const [balances, setBalances] = useState({});

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('splitshare-friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('splitshare-groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('splitshare-expenses', JSON.stringify(expenses));
  }, [expenses]);

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

      expense.splitAmong.forEach(personId => {
        if (personId !== payer) {
          if (!calculatedBalances[personId]) calculatedBalances[personId] = {};
          if (!calculatedBalances[payer]) calculatedBalances[payer] = {};

          let amountOwed;
          if (isPercentageSplit) {
            amountOwed = expense.exactAmounts[personId] || 0;
          } else {
            amountOwed = expense.amount / expense.splitAmong.length;
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
      id: nextId(expenses),
      date: new Date(newExpense.date)
    };
    setExpenses(prev => [...prev, expenseWithId]);
  };

  // Remove an expense by id
  const removeExpense = (expenseId) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  // Record a settlement payment: debtor pays creditor the given amount
  // Creates a virtual expense that zeroes out the debt
  const recordSettlement = (debtorId, creditorId, amount) => {
    const settlement = {
      id: nextId(expenses),
      description: `${getFriend(debtorId)?.name} settled up with ${getFriend(creditorId)?.name}`,
      amount,
      paidBy: debtorId,
      splitAmong: [creditorId],
      splitOption: 'equal',
      category: 'Other',
      date: new Date(),
      isSettlement: true,
    };
    setExpenses(prev => [...prev, settlement]);
  };

  // Add a new person
  const addFriend = (name) => {
    const newFriend = {
      id: nextId(friends),
      name,
      email: `${name.toLowerCase()}@example.com`,
      avatar: '',
    };
    setFriends(prev => [...prev, newFriend]);
  };

  // Remove a person
  const removeFriend = (friendId) => {
    const isInvolved = expenses.some(expense =>
      expense.paidBy === friendId ||
      expense.splitAmong.includes(friendId)
    );

    if (!isInvolved) {
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    }

    return !isInvolved;
  };

  // Add a new group
  const addGroup = (newGroup) => {
    const groupWithId = {
      ...newGroup,
      id: nextId(groups),
      total: 0
    };
    setGroups(prev => [...prev, groupWithId]);
  };

  // Reset all data
  const resetAll = () => {
    setFriends([]);
    setGroups([]);
    setExpenses([]);
    setBalances({});
    localStorage.removeItem('splitshare-friends');
    localStorage.removeItem('splitshare-groups');
    localStorage.removeItem('splitshare-expenses');
  };

  // Get friend by id
  const getFriend = (id) => friends.find(friend => friend.id === id);

  // Get group by id
  const getGroup = (id) => groups.find(group => group.id === id);

  // Get expenses for a specific group
  const getGroupExpenses = (groupId) => expenses.filter(expense => expense.group === groupId);

  // Get all expenses involving a specific friend
  const getFriendExpenses = (friendId) => expenses.filter(expense =>
    expense.paidBy === friendId ||
    expense.splitAmong.includes(friendId)
  );

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
        recordSettlement,
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
