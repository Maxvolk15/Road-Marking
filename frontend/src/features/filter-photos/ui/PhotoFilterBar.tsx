import React from 'react';
import { Box, Chip } from '@mui/material';
import { PhotoStatus } from '../../../entities/photo/model/types';

export type PhotoFilterStatus = 'all' | PhotoStatus;

interface PhotoFilterBarProps {
  currentFilter: PhotoFilterStatus;
  onFilterChange: (status: PhotoFilterStatus) => void;
  counts: {
    all: number;
    processed: number;
    processing: number;
    error: number;
  };
}

export const PhotoFilterBar: React.FC<PhotoFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  counts
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
      <Chip
        label={`Все (${counts.all})`}
        color={currentFilter === 'all' ? 'primary' : 'default'}
        variant={currentFilter === 'all' ? 'filled' : 'outlined'}
        onClick={() => onFilterChange('all')}
        sx={{ fontWeight: 600, cursor: 'pointer' }}
      />
      <Chip
        label={`Обработано (${counts.processed})`}
        color={currentFilter === 'processed' ? 'success' : 'default'}
        variant={currentFilter === 'processed' ? 'filled' : 'outlined'}
        onClick={() => onFilterChange('processed')}
        sx={{ fontWeight: 600, cursor: 'pointer' }}
      />
      <Chip
        label={`В обработке (${counts.processing})`}
        color={currentFilter === 'processing' ? 'warning' : 'default'}
        variant={currentFilter === 'processing' ? 'filled' : 'outlined'}
        onClick={() => onFilterChange('processing')}
        sx={{ fontWeight: 600, cursor: 'pointer' }}
      />
      <Chip
        label={`Ошибка (${counts.error})`}
        color={currentFilter === 'error' ? 'error' : 'default'}
        variant={currentFilter === 'error' ? 'filled' : 'outlined'}
        onClick={() => onFilterChange('error')}
        sx={{ fontWeight: 600, cursor: 'pointer' }}
      />
    </Box>
  );
};
