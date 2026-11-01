import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Badge,
  Popover,
  Snackbar,
  Alert,
  Slide,
  SlideProps
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddRoadIcon from '@mui/icons-material/AddRoad';
import { useData } from '../../entities/model/DataContext';
import { Photo } from '../../entities/photo/model/types';
import { Task } from '../../entities/task/model/types';

const drawerWidth = 260;

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

interface Props {
  window?: () => Window;
}

export const Layout: React.FC<Props> = (props: Props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const location = useLocation();
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  const { notification, closeNotification, photos, tasks } = useData();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
    { text: 'Загрузка фото', icon: <PhotoCameraIcon />, path: '/upload' },
    { text: 'Анализ', icon: <AnalyticsIcon />, path: '/analysis' },
    { text: 'Задания на ремонт', icon: <AssignmentIcon />, path: '/tasks' },
  ];

  // Количество активных уведомлений (необработанные или требующие внимания)
  const processingCount = photos.filter((p: Photo) => p.status === 'processing').length;
  const openTasksCount = tasks.filter((t: Task) => t.status === 'open').length;
  const badgeCount = processingCount + openTasksCount;

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ my: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <AddRoadIcon fontSize="small" />
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
            RoadMark UI
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ mx: 2, mb: 2 }} />
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const selected =
            location.pathname === item.path ||
            (location.pathname.startsWith(item.path) && item.path !== '/');
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={selected}
                sx={{
                  borderRadius: 2,
                  ...(selected && {
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      bgcolor: 'primary.100',
                    }
                  })
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: selected ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: selected ? 600 : 500,
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton 
            size="large" 
            aria-label="show new notifications" 
            color="inherit" 
            sx={{ mr: 2 }}
            onClick={handleNotifClick}
          >
            <Badge badgeContent={badgeCount} color="error">
              <NotificationsIcon color="action" />
            </Badge>
          </IconButton>
          <Popover
            open={Boolean(notifAnchorEl)}
            anchorEl={notifAnchorEl}
            onClose={handleNotifClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            PaperProps={{
              sx: { p: 2.5, mt: 1, borderRadius: 3, minWidth: 260 }
            }}
          >
            <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1.5 }}>
              Уведомления системы
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                • Открытых заданий на ремонт: <b>{openTasksCount}</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Снимков в процессе анализа: <b>{processingCount}</b>
              </Typography>
            </Box>
          </Popover>

          <Avatar alt="Aralushkin Max" src="https://ui-avatars.com/api/?name=Aralushkin+Max&background=0D8ABC&color=fff" />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #e2e8f0' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>

      {/* Всплывающие уведомления при пользовательских действиях */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, boxShadow: 4 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;
