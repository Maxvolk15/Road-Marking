import React from 'react';
import { Box, Chip, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { TaskStatus } from '../../../entities/task/model/types';

export type TaskFilterStatus = 'all' | TaskStatus;

interface TaskFilterBarProps {
  currentStatus: TaskFilterStatus;
  onStatusChange: (status: TaskFilterStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: {
    all: number;
    open: number;
    in_progress: number;
    completed: number;
  };
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  currentStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  counts
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', md: 'center' },
        gap: 2,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={`Все (${counts.all})`}
          color={currentStatus === 'all' ? 'primary' : 'default'}
          variant={currentStatus === 'all' ? 'filled' : 'outlined'}
          onClick={() => onStatusChange('all')}
          sx={{ fontWeight: 600, cursor: 'pointer' }}
        />
        <Chip
          label={`Открыто (${counts.open})`}
          color={currentStatus === 'open' ? 'error' : 'default'}
          variant={currentStatus === 'open' ? 'filled' : 'outlined'}
          onClick={() => onStatusChange('open')}
          sx={{ fontWeight: 600, cursor: 'pointer' }}
        />
        <Chip
          label={`В работе (${counts.in_progress})`}
          color={currentStatus === 'in_progress' ? 'warning' : 'default'}
          variant={currentStatus === 'in_progress' ? 'filled' : 'outlined'}
          onClick={() => onStatusChange('in_progress')}
          sx={{ fontWeight: 600, cursor: 'pointer' }}
        />
        <Chip
          label={`Выполнено (${counts.completed})`}
          color={currentStatus === 'completed' ? 'success' : 'default'}
          variant={currentStatus === 'completed' ? 'filled' : 'outlined'}
          onClick={() => onStatusChange('completed')}
          sx={{ fontWeight: 600, cursor: 'pointer' }}
        />
      </Box>

      <Box sx={{ minWidth: { xs: '100%', md: 320 } }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Поиск по описанию или адресу..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
          sx={{ bgcolor: 'background.paper' }}
        />
      </Box>
    </Box>
  );
};
