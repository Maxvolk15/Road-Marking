import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';
import { mockTasks } from '../mocks/data';

export default function Tasks() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTaskId(null);
  };

  const handleGoToAnalysis = () => {
    const task = mockTasks.find(t => t.id === selectedTaskId);
    if (task) {
      navigate(`/analysis/${task.photoId}`);
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Открыто';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Выполнено';
      default: return status;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Задания на ремонт
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Реестр сгенерированных задач для дорожных служб на основе анализа разметки.
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table sx={{ minWidth: 650 }} aria-label="tasks table">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Фото (источник)</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Описание работ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Адрес</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Дата создания</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Статус</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockTasks.map((task) => (
              <TableRow 
                key={task.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="600" color="text.secondary">
                    #{task.id.toUpperCase()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={`Снимок ${task.photoId}`} size="small" variant="outlined" />
                </TableCell>
                <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {task.description}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2">{task.address || 'Не указан'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(task.createdAt).toLocaleString('ru-RU', { 
                    day: '2-digit', month: '2-digit', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  })}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(task.status)} 
                    color={getStatusColor(task.status) as any} 
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Действия">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, task.id)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleGoToAnalysis}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Подробности анализа</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
