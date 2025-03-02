import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar, 
  Chip,
  Divider,
  Stack,
  IconButton,
  useTheme,
  Tooltip
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon, 
  LocalGasStation as UtilitiesIcon,
  DirectionsCar as TransportationIcon,
  Theaters as EntertainmentIcon,
  FlightTakeoff as TravelIcon,
  ShoppingBag as ShoppingIcon,
  Home as RentIcon,
  Category as OtherIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const getCategoryIcon = (category) => {
  switch(category) {
    case 'Food & Drink': return <RestaurantIcon />;
    case 'Utilities': return <UtilitiesIcon />;
    case 'Transportation': return <TransportationIcon />;
    case 'Entertainment': return <EntertainmentIcon />;
    case 'Travel': return <TravelIcon />;
    case 'Shopping': return <ShoppingIcon />;
    case 'Rent': return <RentIcon />;
    default: return <OtherIcon />;
  }
};

const ExpenseCard = ({ expense }) => {
  const theme = useTheme();
  const { getFriend, expenseCategories, removeExpense } = useAppContext();
  
  const paidBy = getFriend(expense.paidBy)?.name || 'Unknown';
  
  const categoryColor = expenseCategories.find(cat => cat.id === expense.category)?.color || '#868B8E';
  
  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };
  
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const handleDelete = () => {
    removeExpense(expense.id);
  };
  
  return (
    <Card 
      elevation={1}
      sx={{ 
        mb: 2,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{ 
                bgcolor: categoryColor,
                width: 32, 
                height: 32,
                mr: 1.5
              }}
            >
              {getCategoryIcon(expense.category)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" component="div" sx={{ lineHeight: 1.2, fontWeight: 500 }}>
                {expense.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(expense.date)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography 
              variant="subtitle1" 
              component="div" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 600
              }}
            >
              {formatAmount(expense.amount / expense.splitAmong.length)}
            </Typography>
            <Chip 
              label={expense.category} 
              size="small" 
              sx={{ 
                bgcolor: categoryColor + '20',
                color: categoryColor,
                fontWeight: 500,
                borderRadius: '4px',
                height: '20px',
                fontSize: '0.65rem',
                mt: 0.3
              }} 
            />
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {`${paidBy || 'Someone'} paid ${formatAmount(expense.amount)}`}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              <Box component="span" sx={{ color: 'text.secondary' }}>
                Split {expense.splitOption === 'percentage' ? '(by percentage)' : `(${formatAmount(expense.amount / expense.splitAmong.length)} each)`}: 
              </Box> 
              {expense.splitAmong.map(id => {
                const name = getFriend(id)?.name || 'Unknown';
                if (expense.splitOption === 'percentage' && expense.exactAmounts) {
                  const amount = expense.exactAmounts[id] || 0;
                  const percentage = ((amount / expense.amount) * 100).toFixed(0);
                  return `${name} (${percentage}%)`;
                }
                return name;
              }).join(', ')}
            </Typography>
          </Box>
          
          <Tooltip title="Delete expense">
            <IconButton size="small" onClick={handleDelete} sx={{ color: theme.palette.error.main }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;