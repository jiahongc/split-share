import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Button,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  useTheme,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import ExpenseCard from '../components/ExpenseCard';
import AddExpenseDialog from '../components/AddExpenseDialog';
import PeopleManager from '../components/PeopleManager';
import ExpensesByCategory from '../components/ExpensesByCategory';

const Dashboard = () => {
  const theme = useTheme();
  const { expenses, balances, friends, getFriend } = useAppContext();
  
  // Color palette for people avatars - same as in PeopleManager
  const colorPalette = useMemo(() => [
    '#FF6384', // Pink
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#32CD32', // Lime Green
    '#BA55D3', // Medium Orchid
    '#20B2AA', // Light Sea Green
    '#FF6347'  // Tomato
  ], []);
  
  // Function to get a consistent color for a person based on their ID
  const getPersonColor = (id) => {
    return colorPalette[(id - 1) % colorPalette.length];
  };
  
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  
  const handleOpenExpenseDialog = () => {
    setExpenseDialogOpen(true);
  };
  
  const handleCloseExpenseDialog = () => {
    setExpenseDialogOpen(false);
  };
  
  // Sort expenses by date (newest first)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
    
  // Calculate friend balances - flattened for UI display
  const friendBalances = [];
  
  // Only process balances if we have at least 2 people
  if (friends.length >= 2) {
    Object.entries(balances).forEach(([personId, personBalances]) => {
      Object.entries(personBalances).forEach(([otherPersonId, amount]) => {
        // Only add positive balances (negative ones will be covered from the other direction)
        if (amount > 0) {
          friendBalances.push({
            person: getFriend(Number(personId)),
            otherPerson: getFriend(Number(otherPersonId)),
            amount
          });
        }
      });
    });
  }
  
  // Sort by amount (largest first)
  friendBalances.sort((a, b) => b.amount - a.amount);
  
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AddExpenseDialog 
        open={expenseDialogOpen}
        onClose={handleCloseExpenseDialog}
      />
      
      {/* People Manager Section */}
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <PeopleManager />
        </Grid>
        
        {friends.length < 2 && (
          <Grid item xs={12} md={10}>
            <Alert 
              severity="info" 
              icon={<InfoIcon />}
              sx={{ mb: 3 }}
            >
              Add at least two people to start tracking expenses
            </Alert>
          </Grid>
        )}
        
        {/* Add Expense Button */}
        {friends.length >= 2 && (
          <Grid item xs={12}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleOpenExpenseDialog}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Add Expense
              </Button>
            </Box>
          </Grid>
        )}
        
        {/* Balances Section */}
        {friends.length >= 2 && (
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Balances
              </Typography>
              
              {friendBalances.length > 0 ? (
                <List sx={{ px: 0 }}>
                  {friendBalances.map((balance, index) => (
                    <ListItem
                      key={index}
                      sx={{ px: 1 }}
                    >
                      <ListItemAvatar>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar 
                            src={balance.person.avatar}
                            alt={balance.person.name}
                            sx={{ bgcolor: getPersonColor(balance.person.id) }}
                          >
                            {balance.person.name.charAt(0)}
                          </Avatar>
                          <Avatar 
                            src={balance.otherPerson.avatar}
                            alt={balance.otherPerson.name}
                            sx={{ 
                              bgcolor: getPersonColor(balance.otherPerson.id),
                              width: 22, 
                              height: 22,
                              fontSize: '0.75rem',
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              border: `2px solid ${theme.palette.background.paper}`
                            }}
                          >
                            {balance.otherPerson.name.charAt(0)}
                          </Avatar>
                        </Box>
                      </ListItemAvatar>
                      <ListItemText
                        primary={balance.person.name}
                        secondary={
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{ 
                                color: theme.palette.success.main,
                                fontWeight: 'bold'
                              }}
                            >
                              is owed {formatAmount(balance.amount)} by {balance.otherPerson.name}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No balances yet
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
        
        {/* Expenses Section */}
        {friends.length >= 2 && (
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  Expenses
                </Typography>
              </Box>
              
              <Box sx={{ maxHeight: 500, overflow: 'auto', pr: 1 }}>
                {recentExpenses.length > 0 ? (
                  recentExpenses.map(expense => (
                    <ExpenseCard key={expense.id} expense={expense} />
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No expenses yet. Add your first expense!
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenExpenseDialog}
                      sx={{ mt: 2 }}
                    >
                      Add Expense
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* Chart Section */}
        {friends.length >= 2 && expenses.length > 0 && (
          <Grid item xs={12} md={10}>
            <ExpensesByCategory />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;