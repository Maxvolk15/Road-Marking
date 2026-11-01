import React from 'react';
import { Box } from '@mui/material';
import { PageHeader } from '../../shared/ui/PageHeader';
import { UploadPhotoForm } from '../../features/upload-photo';

export const UploadPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Загрузка фотографий"
        subtitle="Загрузите изображения улиц и укажите адрес для автоматического анализа дефектов разметки."
      />
      <UploadPhotoForm />
    </Box>
  );
};
