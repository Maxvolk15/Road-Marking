import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import { useNavigate } from 'react-router-dom';

import { useData } from '../../entities/model/DataContext';
import { TaskStatus } from '../../entities/task/model/types';
import { TaskStatusChip } from '../../entities/task';
import { PageHeader } from '../../shared/ui/PageHeader';
import { EmptyState } from '../../shared/ui/EmptyState';
import { TaskFilterBar, TaskFilterStatus } from '../../features/filter-tasks';
import { CreateTaskDialog } from '../../features/create-task';
import { formatDateTime } from '../../shared/lib/date';

export const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, updateTaskStatus, deleteTask } = useData();

  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<TaskFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Состояние контекстного меню
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
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
      navigate(`/analysis/${task.photoId}`);
    }
    handleMenuClose();
  };

  const handleToggleStatusFromMenu = () => {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
      const nextStatus: Record<TaskStatus, TaskStatus> = {
        open: 'in_progress',
        in_progress: 'completed',
        completed: 'open'
      };
      updateTaskStatus(task.id, nextStatus[task.status]);
    }
    handleMenuClose();
  };

  const handleDeleteFromMenu = () => {
    if (selectedTaskId) {
      deleteTask(selectedTaskId);
    }
    handleMenuClose();
  };

  const handleCycleStatus = (taskId: string, currentStatus: TaskStatus) => {
    const cycle: Record<TaskStatus, TaskStatus> = {
      open: 'in_progress',
      in_progress: 'completed',
      completed: 'open'
    };
    updateTaskStatus(taskId, cycle[currentStatus]);
  };

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      open: tasks.filter(t => t.status === 'open').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Фильтр по статусу
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      // Поиск по описанию или адресу
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inDesc = task.description.toLowerCase().includes(q);
        const inAddr = (task.address || '').toLowerCase().includes(q);
        const inId = task.id.toLowerCase().includes(q);
        if (!inDesc && !inAddr && !inId) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, searchQuery]);

  return (
    <Box>
      <PageHeader
        title="Задания на ремонт"
        subtitle="Реестр сгенерированных задач для дорожных служб на основе анализа разметки."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Создать задание
          </Button>
        }
      />

      <TaskFilterBar
        currentStatus={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      {filteredTasks.length === 0 ? (
        <EmptyState
          title="Задания не найдены"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'По текущим параметрам поиска и фильтрации ничего не найдено.'
              : 'В системе пока нет активных ремонтных заданий.'
          }
          actionLabel={searchQuery || statusFilter !== 'all' ? 'Сбросить фильтры' : 'Создать первое задание'}
          onAction={() => {
            if (searchQuery || statusFilter !== 'all') {
              setSearchQuery('');
              setStatusFilter('all');
            } else {
              setCreateDialogOpen(true);
            }
          }}
        />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
        >
          <Table sx={{ minWidth: 700 }} aria-label="таблица ремонтных заданий">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Фото (источник)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Описание работ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Адрес</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Дата создания</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Статус</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map(task => (
                <TableRow
                  key={task.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.15s'
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                      #{task.id.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`Снимок #${task.photoId.toUpperCase()}`}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => navigate(`/analysis/${task.photoId}`)}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260, whiteSpace: 'normal' }}>
                    <Typography variant="body2">{task.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2">{task.address || 'Не указан'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(task.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Нажмите для смены статуса">
                      <span>
                        <TaskStatusChip
                          status={task.status}
                          onClick={() => handleCycleStatus(task.id, task.status)}
                        />
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Действия">
                      <IconButton size="small" onClick={e => handleMenuOpen(e, task.id)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Контекстное меню действий со строкой */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 190 } }}
      >
        <MenuItem onClick={handleGoToAnalysis}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Подробности анализа</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleStatusFromMenu}>
          <ListItemIcon>
            <ChangeCircleOutlinedIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText>Следующий статус</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteFromMenu} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить задание</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог создания задания */}
      <CreateTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
};
