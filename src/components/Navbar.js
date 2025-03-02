import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Box, 
  Menu, 
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  Group as GroupIcon, 
  Receipt as ReceiptIcon, 
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = ({ onResetData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { friends } = useAppContext();
  const location = useLocation();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const navItems = [];
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          SplitShare
        </Typography>
        <Typography variant="body2">
          Track expenses together
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.title}
            component={Link}
            to={item.path}
            selected={isActive(item.path)}
            sx={{
              color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
              backgroundColor: isActive(item.path) ? theme.palette.primary.light + '20' : 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.primary.light + '30',
              },
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
                minWidth: '40px' 
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/settings">
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <Box 
              component="span" 
              sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 'bold',
                mr: 1
              }}
            >
              Split
            </Box>
            <Box component="span">Share</Box>
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.title}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  sx={{
                    mx: 1,
                    color: isActive(item.path) ? theme.palette.primary.main : 'inherit',
                    fontWeight: isActive(item.path) ? 'bold' : 'regular',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  {item.title}
                </Button>
              ))}
            </Box>
          )}
          
          <Button
            variant="outlined"
            color="error"
            onClick={onResetData}
          >
            Reset All Data
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawerContent}
      </Drawer>
      
      {/* Add a Toolbar for proper spacing below the AppBar */}
      <Toolbar />
    </>
  );
};

export default Navbar;