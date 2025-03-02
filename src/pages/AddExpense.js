import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Divider,
  Grid,
  Chip,
  Stack,
  Avatar,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const AddExpense = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { friends, groups, expenseCategories, addExpense } = useAppContext();
  
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    date: dayjs(),
    group: '',
    splitAmong: [],
    category: ''
  });
  
  const [errors, setErrors] = useState({
    description: false,
    amount: false,
    paidBy: false,
    group: false,
    splitAmong: false,
    category: false
  });
  
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
    const selectedFriendIds = e.target.value;
    setExpense({
      ...expense,
      splitAmong: selectedFriendIds
    });
    
    if (selectedFriendIds.length > 0 && errors.splitAmong) {
      setErrors({
        ...errors,
        splitAmong: false
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {
      description: !expense.description,
      amount: !expense.amount || isNaN(expense.amount) || Number(expense.amount) <= 0,
      paidBy: !expense.paidBy,
      group: !expense.group,
      splitAmong: !expense.splitAmong.length,
      category: !expense.category
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert amount to number
      const newExpense = {
        ...expense,
        amount: parseFloat(expense.amount),
        date: expense.date.toDate()
      };
      
      addExpense(newExpense);
      navigate('/');
    }
  };
  
  const handleCancel = () => {
    navigate('/');
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Add New Expense
          </Typography>
          <Divider sx={{ mb: 4 }} />
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
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
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={errors.paidBy}>
                  <InputLabel>Paid By</InputLabel>
                  <Select
                    name="paidBy"
                    value={expense.paidBy}
                    onChange={handleInputChange}
                    label="Paid By"
                  >
                    <MenuItem value={1}>You</MenuItem>
                    {friends.map(friend => (
                      <MenuItem key={friend.id} value={friend.id}>
                        {friend.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.paidBy && <FormHelperText>Please select who paid</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={errors.group}>
                  <InputLabel>Group</InputLabel>
                  <Select
                    name="group"
                    value={expense.group}
                    onChange={handleInputChange}
                    label="Group"
                  >
                    {groups.map(group => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.group && <FormHelperText>Please select a group</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={errors.splitAmong}>
                  <InputLabel>Split Among</InputLabel>
                  <Select
                    name="splitAmong"
                    multiple
                    value={expense.splitAmong}
                    onChange={handleSplitAmongChange}
                    label="Split Among"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const friend = friends.find(f => f.id === value) || { id: 1, name: 'You' };
                          return (
                            <Chip 
                              key={value} 
                              label={friend.name}
                              avatar={<Avatar>{friend.name.charAt(0)}</Avatar>}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    <MenuItem value={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.main }}>Y</Avatar>
                        <Typography>You</Typography>
                      </Stack>
                    </MenuItem>
                    {friends.map(friend => (
                      <MenuItem key={friend.id} value={friend.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 24, height: 24 }}>{friend.name.charAt(0)}</Avatar>
                          <Typography>{friend.name}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.splitAmong && <FormHelperText>Please select at least one person</FormHelperText>}
                </FormControl>
              </Grid>
              
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
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                color="inherit"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                size="large"
              >
                Add Expense
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default AddExpense;