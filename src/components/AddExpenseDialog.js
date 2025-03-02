import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Grid,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Typography,
  Divider,
  useTheme,
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon,
  Info as InfoIcon 
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useAppContext } from '../context/AppContext';

const AddExpenseDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const { friends, expenseCategories, addExpense } = useAppContext();
  
  // Color palette for people avatars - same as in PeopleManager and Dashboard
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
  
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    date: dayjs(),
    splitOption: 'equal',
    splitAmong: [],
    category: '',
    splitPercentages: {}
  });
  
  const [errors, setErrors] = useState({
    description: false,
    amount: false,
    paidBy: false,
    splitAmong: false,
    category: false
  });

  // Update split among whenever expense.paidBy changes or friends list changes
  useEffect(() => {
    // If we have a payer set, include everybody in split by default
    if (expense.paidBy && friends.length >= 2) {
      const allIds = friends.map(f => f.id);
      
      // Initialize with equal percentages
      const equalPercent = 100 / allIds.length;
      const initialPercentages = {};
      allIds.forEach(id => {
        initialPercentages[id] = equalPercent;
      });
      
      setExpense(prev => ({
        ...prev,
        splitAmong: allIds,
        splitPercentages: initialPercentages
      }));
    }
  }, [expense.paidBy, friends]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpense({
      ...expense,
      [name]: value
    });
    
    // Clear error when field is filled
    if (value && errors[name]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };
  
  const handleDateChange = (newDate) => {
    setExpense({
      ...expense,
      date: newDate
    });
  };
  
  const handleSplitAmongChange = (e) => {
    const selectedIds = e.target.value;
    
    // Re-calculate percentages when people are added/removed
    const equalPercent = selectedIds.length > 0 ? 100 / selectedIds.length : 0;
    const newPercentages = {};
    
    selectedIds.forEach(id => {
      newPercentages[id] = equalPercent;
    });
    
    setExpense({
      ...expense,
      splitAmong: selectedIds,
      splitPercentages: newPercentages
    });
    
    if (selectedIds.length > 0 && errors.splitAmong) {
      setErrors({
        ...errors,
        splitAmong: false
      });
    }
  };
  
  // Handle percentage change for a specific person
  const handlePercentageChange = (personId, value) => {
    // Ensure value is a valid number between 0 and 100
    let newValue = parseFloat(value) || 0;
    newValue = Math.min(100, Math.max(0, newValue));
    
    // Update percentages for this person
    const newPercentages = {
      ...expense.splitPercentages,
      [personId]: newValue
    };
    
    setExpense({
      ...expense,
      splitPercentages: newPercentages
    });
  };
  
  const validateForm = () => {
    const newErrors = {
      description: !expense.description && expense.category === 'Other',
      amount: !expense.amount || isNaN(expense.amount) || Number(expense.amount) <= 0,
      paidBy: !expense.paidBy,
      splitAmong: !expense.splitAmong.length,
      category: !expense.category
    };
    
    // Validate percentages if using percentage split
    if (expense.splitOption === 'percentage') {
      const totalPercentage = Object.values(expense.splitPercentages)
        .reduce((sum, value) => sum + parseFloat(value || 0), 0);
      
      // Round to handle floating point errors
      if (Math.round(totalPercentage) !== 100) {
        newErrors.splitAmong = true;
      }
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Calculate individual amounts if using percentage split
      const isPercentageSplit = expense.splitOption === 'percentage';
      const totalAmount = parseFloat(expense.amount);
      
      let processedExpense = {
        ...expense,
        amount: totalAmount,
        date: expense.date.toDate()
      };
      
      // If using percentage split, calculate actual split amounts based on percentages
      if (isPercentageSplit) {
        const exactAmounts = {};
        
        // Calculate exact amounts for each person based on their percentage
        expense.splitAmong.forEach(personId => {
          const percentage = expense.splitPercentages[personId] || 0;
          exactAmounts[personId] = (percentage / 100) * totalAmount;
        });
        
        processedExpense.exactAmounts = exactAmounts;
      }
      
      addExpense(processedExpense);
      handleClose();
    }
  };
  
  const handleClose = () => {
    // Reset form on close
    setExpense({
      description: '',
      amount: '',
      paidBy: '',
      date: dayjs(),
      splitOption: 'equal',
      splitAmong: [],
      category: '',
      splitPercentages: {}
    });
    setErrors({
      description: false,
      amount: false,
      paidBy: false,
      splitAmong: false,
      category: false
    });
    onClose();
  };

  // Create a list of all people who can be split among excluding the payer
  const eligibleForSplit = expense.paidBy 
    ? friends.filter(friend => friend.id !== Number(expense.paidBy)) 
    : friends;
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add New Expense
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {friends.length < 2 ? (
            <Alert 
              severity="warning" 
              icon={<InfoIcon />}
              sx={{ mb: 2 }}
            >
              Add at least two people before creating expenses
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={expense.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {expenseCategories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: 8, 
                              bgcolor: category.color,
                              mr: 1 
                            }} 
                          />
                          {category.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText>Please select a category</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  placeholder="What was this expense for?"
                  fullWidth
                  value={expense.description}
                  onChange={handleInputChange}
                  error={errors.description}
                  helperText={errors.description ? "Description is required" : ""}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="amount"
                  label="Amount"
                  placeholder="0.00"
                  fullWidth
                  type="number"
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>
                  }}
                  value={expense.amount}
                  onChange={handleInputChange}
                  error={errors.amount}
                  helperText={errors.amount ? "Valid amount is required" : ""}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={expense.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={errors.paidBy}>
                  <InputLabel>Paid By</InputLabel>
                  <Select
                    name="paidBy"
                    value={expense.paidBy}
                    onChange={handleInputChange}
                    label="Paid By"
                  >
                    {friends.map(person => (
                      <MenuItem key={person.id} value={person.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              width: 24,
                              height: 24,
                              mr: 1,
                              fontSize: '0.8rem'
                            }}
                          >
                            {person.name.charAt(0)}
                          </Avatar>
                          {person.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.paidBy && <FormHelperText>Please select who paid</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth disabled={!expense.paidBy}>
                  <InputLabel>Split Type</InputLabel>
                  <Select
                    name="splitOption"
                    value={expense.splitOption}
                    onChange={handleInputChange}
                    label="Split Type"
                  >
                    <MenuItem value="equal">Equal Split</MenuItem>
                    <MenuItem value="percentage">Percentage Split</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={errors.splitAmong} disabled={!expense.paidBy}>
                  <InputLabel>Split Among</InputLabel>
                  <Select
                    name="splitAmong"
                    multiple
                    value={expense.splitAmong}
                    onChange={handleSplitAmongChange}
                    label="Split Among"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((personId) => {
                          const person = friends.find(f => f.id === personId);
                          return person ? (
                            <Chip 
                              key={personId} 
                              label={person.name} 
                              size="small"
                              avatar={
                                <Avatar
                                  sx={{ bgcolor: theme.palette.primary.main }}
                                >
                                  {person.name.charAt(0)}
                                </Avatar>
                              }
                            />
                          ) : null;
                        })}
                      </Box>
                    )}
                  >
                    {/* Include the payer */}
                    {expense.paidBy && (
                      <MenuItem key={expense.paidBy} value={Number(expense.paidBy)}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {friends.find(f => f.id === Number(expense.paidBy))?.name} (payer)
                        </Box>
                      </MenuItem>
                    )}

                    {/* Add eligible people */}
                    {eligibleForSplit.map(person => (
                      <MenuItem key={person.id} value={person.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              width: 24,
                              height: 24,
                              mr: 1,
                              fontSize: '0.8rem'
                            }}
                          >
                            {person.name.charAt(0)}
                          </Avatar>
                          {person.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.splitAmong && expense.splitOption === 'equal' && <FormHelperText>Please select who to split with</FormHelperText>}
                  {errors.splitAmong && expense.splitOption === 'percentage' && <FormHelperText>Percentages must add up to 100%</FormHelperText>}
                  {!expense.paidBy && <FormHelperText>Select who paid first</FormHelperText>}
                </FormControl>
              </Grid>
              
              {/* Percentage inputs when using percentage split */}
              {expense.splitOption === 'percentage' && expense.splitAmong.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Split Percentages
                  </Typography>
                  <Box sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1 }}>
                    <Stack spacing={2}>
                      {expense.splitAmong.map(personId => {
                        const person = friends.find(f => f.id === personId);
                        if (!person) return null;
                        
                        return (
                          <Box key={personId} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{ 
                                bgcolor: theme.palette.primary.main,
                                width: 24,
                                height: 24,
                                mr: 1,
                                fontSize: '0.8rem'
                              }}
                            >
                              {person.name.charAt(0)}
                            </Avatar>
                            <Typography sx={{ minWidth: 100 }}>{person.name}</Typography>
                            <TextField
                              type="number"
                              size="small"
                              value={expense.splitPercentages[personId] || 0}
                              onChange={(e) => handlePercentageChange(personId, e.target.value)}
                              InputProps={{
                                endAdornment: <Box component="span">%</Box>,
                                inputProps: { min: 0, max: 100, step: 5 }
                              }}
                              sx={{ width: 100, ml: 2 }}
                            />
                          </Box>
                        );
                      })}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                        <Typography variant="body2">Total:</Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: Math.round(Object.values(expense.splitPercentages).reduce((sum, val) => sum + parseFloat(val || 0), 0)) === 100 
                              ? 'success.main' 
                              : 'error.main'
                          }}
                        >
                          {Object.values(expense.splitPercentages).reduce((sum, val) => sum + parseFloat(val || 0), 0).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={friends.length < 2}
          >
            Add Expense
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddExpenseDialog;