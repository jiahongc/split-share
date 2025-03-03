import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useAppContext } from '../context/AppContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ExpensesByCategory = () => {
  const theme = useTheme();
  const { expenses, expenseCategories, friends, getFriend } = useAppContext();
  const [chartData, setChartData] = useState({ datasets: [] });
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    if (expenses.length === 0 || friends.length === 0) {
      return;
    }

    // Group expenses by category
    const expensesByCategory = {};
    expenseCategories.forEach(category => {
      expensesByCategory[category.id] = {};
      
      // Initialize spending for each friend to 0
      friends.forEach(friend => {
        expensesByCategory[category.id][friend.id] = 0;
      });
    });

    // Calculate spending by category for each person
    expenses.forEach(expense => {
      const { category, amount, splitAmong, paidBy, splitOption, exactAmounts } = expense;
      
      if (!category) return;
      
      // Calculate amount per person based on split type
      splitAmong.forEach(personId => {
        if (expensesByCategory[category]) {
          let personAmount;
          if (splitOption === 'percentage' && exactAmounts) {
            personAmount = exactAmounts[personId] || 0;
          } else {
            personAmount = amount / splitAmong.length;
          }
          
          expensesByCategory[category][personId] = 
            (expensesByCategory[category][personId] || 0) + personAmount;
        }
      });
    });

    // Prepare chart data
    const labels = expenseCategories
      .filter(cat => Object.values(expensesByCategory[cat.id] || {}).some(val => val > 0))
      .map(cat => cat.name);
    
    // Create a color palette for users
    const colorPalette = [
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
    ];
    
    const datasets = friends.map((friend, index) => {
      const personData = [];
      
      expenseCategories
        .filter(cat => Object.values(expensesByCategory[cat.id] || {}).some(val => val > 0))
        .forEach(cat => {
          personData.push(expensesByCategory[cat.id][friend.id] || 0);
        });
      
      // Use the color palette and cycle through if more colors needed
      const colorIndex = index % colorPalette.length;
      
      return {
        label: friend.name,
        data: personData,
        backgroundColor: colorPalette[colorIndex],
        borderColor: colorPalette[colorIndex],
        borderWidth: 1,
      };
    });

    setChartData({
      labels,
      datasets,
    });

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount ($)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      }
    });
  }, [expenses, expenseCategories, friends, theme]);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Expenses by Category
      </Typography>
      <Box sx={{ height: 300 }}>
        {chartData.datasets.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No expense data to display
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ExpensesByCategory;