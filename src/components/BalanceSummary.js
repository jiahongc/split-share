import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Stack, 
  Button,
  useTheme,
  Alert
} from '@mui/material';
import { 
  ArrowDownward as DownIcon, 
  ArrowUpward as UpIcon,
  AccountBalanceWallet as SettleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const BalanceSummary = () => {
  const theme = useTheme();
  const { balances, friends } = useAppContext();
  
  // Calculate total balances from the new structure
  const totalBalances = { owed: 0, owe: 0 };
  
  if (friends.length >= 2 && Object.keys(balances).length > 0) {
    // For each person
    Object.entries(balances).forEach(([personId, personBalances]) => {
      // For each person they have a balance with
      Object.entries(personBalances).forEach(([otherPersonId, amount]) => {
        if (amount > 0) {
          totalBalances.owed += amount;
        } else if (amount < 0) {
          totalBalances.owe += Math.abs(amount);
        }
      });
    });
  }
  
  // Since every debt is counted twice (positive for one, negative for other), 
  // we divide by 2 to get the actual total
  totalBalances.owed = totalBalances.owed / 2;
  totalBalances.owe = totalBalances.owe / 2;
  
  const netBalance = totalBalances.owed - totalBalances.owe;
  
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  if (friends.length < 2) {
    return (
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          borderRadius: 3,
        }}
      >
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
        >
          Add at least two people to see balance summary
        </Alert>
      </Paper>
    );
  }
  
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        width: '150px', 
        height: '150px', 
        borderRadius: '0 0 0 100%',
        backgroundColor: theme.palette.primary.light + '20',
        zIndex: 0
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Balance Summary
        </Typography>
        
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <DownIcon sx={{ color: theme.palette.success.main }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total Owed
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold" color={theme.palette.success.main}>
              {formatAmount(totalBalances.owed)}
            </Typography>
          </Box>
          
          <Divider orientation="vertical" flexItem />
          
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <UpIcon sx={{ color: theme.palette.error.main }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total Owing
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold" color={theme.palette.error.main}>
              {formatAmount(totalBalances.owe)}
            </Typography>
          </Box>
        </Stack>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Net Balance
          </Typography>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            color={
              netBalance > 0 
                ? theme.palette.success.main 
                : netBalance < 0 
                  ? theme.palette.error.main 
                  : theme.palette.text.primary
            }
          >
            {formatAmount(netBalance)}
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          size="large"
          startIcon={<SettleIcon />}
          sx={{ 
            borderRadius: 2,
            py: 1.5
          }}
        >
          Settle All Balances
        </Button>
      </Box>
    </Paper>
  );
};

export default BalanceSummary;