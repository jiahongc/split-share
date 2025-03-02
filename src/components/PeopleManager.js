import React, { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Collapse,
  useTheme
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const PeopleManager = () => {
  const theme = useTheme();
  const { friends, addFriend, removeFriend } = useAppContext();
  const [newPersonName, setNewPersonName] = useState('');
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [expanded, setExpanded] = useState(false);
  
  // Color palette for people avatars
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

  const handleAddPerson = () => {
    if (!newPersonName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    // Check if name already exists
    if (friends.some(friend => friend.name.toLowerCase() === newPersonName.trim().toLowerCase())) {
      setError('A person with this name already exists');
      return;
    }
    
    addFriend(newPersonName.trim());
    setNewPersonName('');
    setError('');
  };

  const handleDeleteRequest = (person) => {
    setPersonToDelete(person);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (personToDelete) {
      const success = removeFriend(personToDelete.id);
      if (!success) {
        setDeleteError(`Cannot remove ${personToDelete.name} because they're involved in expenses`);
      } else {
        setDeleteError(null);
      }
    }
    setShowDeleteDialog(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setPersonToDelete(null);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: expanded ? 1 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            People ({friends.length})
          </Typography>
          {!expanded && friends.length > 0 && (
            <Box sx={{ display: 'flex', ml: 2, alignItems: 'center' }}>
              {friends.slice(0, 3).map((person) => (
                <Avatar 
                  key={person.id} 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    fontSize: '0.75rem', 
                    bgcolor: getPersonColor(person.id),
                    ml: -0.5,
                    border: `1px solid ${theme.palette.background.paper}`
                  }}
                >
                  {person.name.charAt(0)}
                </Avatar>
              ))}
              {friends.length > 3 && (
                <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>
                  +{friends.length - 3} more
                </Typography>
              )}
            </Box>
          )}
        </Box>
        <IconButton onClick={toggleExpanded} size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', mb: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Enter person name"
              value={newPersonName}
              onChange={(e) => {
                setNewPersonName(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPersonName.trim()) {
                  handleAddPerson();
                }
              }}
              error={!!error}
              helperText={error}
            />
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddPerson}
              sx={{ ml: 1 }}
              size="small"
            >
              Add
            </Button>
          </Box>
          
          {deleteError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {deleteError}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        {friends.length > 0 ? (
          <List sx={{ py: 0 }} dense>
            {friends.map((person) => (
              <ListItem
                key={person.id}
                secondaryAction={
                  <Tooltip title="Delete person">
                    <IconButton edge="end" onClick={() => handleDeleteRequest(person)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: getPersonColor(person.id), 
                    width: 30, 
                    height: 30, 
                    fontSize: '0.9rem' 
                  }}>
                    {person.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={person.name}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <PersonIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No people added yet
            </Typography>
          </Box>
        )}
      </Collapse>
      
      <Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {personToDelete?.name}? 
            This can only be done if they are not involved in any expenses.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PeopleManager;