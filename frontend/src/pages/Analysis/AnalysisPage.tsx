import React, { useState, useMemo } from 'react';
import { Box, Grid, Grow, Button, Skeleton, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useData } from '../../entities/model/DataContext';
import { PageHeader } from '../../shared/ui/PageHeader';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { PhotoCard } from '../../entities/photo';
import { PhotoFilterBar, PhotoFilterStatus } from '../../features/filter-photos';

export const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { photos, isLoading, error, clearError } = useData();
  const [filter, setFilter] = useState<PhotoFilterStatus>('all');

  const counts = useMemo(() => {
    return {
      all: photos.length,
      processed: photos.filter(p => p.status === 'processed').length,
      processing: photos.filter(p => p.status === 'processing').length,
      error: photos.filter(p => p.status === 'error').length
    };
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (filter === 'all') return photos;
    return photos.filter(p => p.status === filter);
  }, [photos, filter]);

  return (
    <Box>
      <PageHeader
        title="Результаты анализа"
        subtitle="Список обработанных изображений и обнаруженных дефектов разметки."
        action={
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate('/upload')}
          >
            Новый снимок
          </Button>
        }
      />

      {error ? (
        <ErrorState
          title="Сбой загрузки данных"
          message={error}
          onRetry={clearError}
          retryLabel="Сбросить ошибку"
        />
      ) : (
        <>
          <PhotoFilterBar
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />

          {isLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map(item => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <Skeleton variant="rectangular" height={180} animation="wave" />
                    <CardContent>
                      <Skeleton variant="text" width="60%" height={28} />
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton variant="rounded" width="40%" height={24} sx={{ mt: 2 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : filteredPhotos.length === 0 ? (
            <EmptyState
              title="Снимки не найдены"
              description={
                filter !== 'all'
                  ? `По фильтру «${filter}» не найдено ни одного снимка.`
                  : 'В системе пока нет загруженных фотографий дорожных участков.'
              }
              actionLabel={filter !== 'all' ? 'Сбросить фильтр' : 'Загрузить первое фото'}
              onAction={() => {
                if (filter !== 'all') {
                  setFilter('all');
                } else {
                  navigate('/upload');
                }
              }}
            />
          ) : (
            <Grid container spacing={3}>
              {filteredPhotos.map((photo, index) => (
                <Grid item xs={12} sm={6} md={4} key={photo.id}>
                  <Grow in timeout={(index + 1) * 150}>
                    <Box sx={{ height: '100%' }}>
                      <PhotoCard photo={photo} />
                    </Box>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};
