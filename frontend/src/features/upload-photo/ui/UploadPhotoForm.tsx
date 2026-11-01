import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  TextField,
  LinearProgress,
  Alert,
  Fade
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../entities/model/DataContext';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const UploadPhotoForm: React.FC = () => {
  const navigate = useNavigate();
  const { addPhoto } = useData();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');

  // Состояния валидации
  const [addressError, setAddressError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [addressTouched, setAddressTouched] = useState<boolean>(false);

  // Состояние процесса анализа
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const validateAddress = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setAddressError('Адрес обязателен для заполнения.');
      return false;
    }
    if (trimmed.length < 3) {
      setAddressError('Адрес должен содержать не менее 3 символов.');
      return false;
    }
    if (trimmed.length > 255) {
      setAddressError('Адрес не должен превышать 255 символов.');
      return false;
    }
    setAddressError(null);
    return true;
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddress(val);
    if (addressTouched) {
      validateAddress(val);
    }
  };

  const handleAddressBlur = () => {
    setAddressTouched(true);
    validateAddress(address);
  };

  const handleFileSelection = (file: File) => {
    setFileError(null);

    // Валидация типа файла
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Неподдерживаемый формат. Пожалуйста, выберите файл JPG, PNG или WEBP.');
      return;
    }

    // Валидация размера файла
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError('Размер файла превышает 10 МБ. Выберите файл меньшего размера.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileSelection(event.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setFileError(null);
    setUploadSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressTouched(true);

    const isAddrValid = validateAddress(address);
    if (!selectedFile) {
      setFileError('Пожалуйста, выберите файл изображения.');
      return;
    }
    if (!isAddrValid || !preview) return;

    setIsSubmitting(true);
    setUploadProgress(15);
    setProgressStage('Загрузка кадра на сервер обработки...');

    // Имитация этапов передачи и анализа
    const timer1 = setTimeout(() => {
      setUploadProgress(45);
      setProgressStage('Предобработка кадра и нормализация освещения...');
    }, 400);

    const timer2 = setTimeout(() => {
      setUploadProgress(80);
      setProgressStage('Нейросетевая детекция стёртых линий и пробелов...');
    }, 900);

    const timer3 = setTimeout(async () => {
      setUploadProgress(100);
      setProgressStage('Формирование карточки анализа...');

      await addPhoto({
        file: selectedFile,
        previewUrl: preview,
        address: address.trim()
      });

      setIsSubmitting(false);
      setUploadSuccess(true);
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {fileError && (
        <Fade in={Boolean(fileError)}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setFileError(null)}>
            {fileError}
          </Alert>
        </Fade>
      )}

      {uploadSuccess && (
        <Fade in={uploadSuccess}>
          <Alert
            severity="success"
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/analysis')}>
                Перейти к анализу →
              </Button>
            }
          >
            Снимок успешно загружен и передан в систему анализа!
          </Alert>
        </Fade>
      )}

      <Paper
        elevation={0}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          p: { xs: 3, sm: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          border: '2px dashed',
          borderColor: selectedFile ? 'primary.main' : 'divider',
          backgroundColor: selectedFile ? 'primary.50' : 'background.default',
          transition: 'all 0.25s ease',
          minHeight: 320,
          borderRadius: 3
        }}
      >
        {!selectedFile ? (
          <>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '50%',
                backgroundColor: 'primary.50',
                color: 'primary.main',
                mb: 1
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 52 }} />
            </Box>
            <Typography variant="h6" align="center" fontWeight={600}>
              Перетащите файл сюда или нажмите для выбора
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Поддерживаются форматы: JPG, PNG, WEBP (макс. 10 МБ)
            </Typography>

            <Button component="label" variant="contained" size="large">
              Выбрать изображение
              <input
                type="file"
                hidden
                accept="image/jpeg, image/png, image/webp"
                onChange={handleFileInputChange}
              />
            </Button>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: 520
            }}
          >
            <Box sx={{ position: 'relative', mb: 2.5 }}>
              {preview && (
                <Box
                  component="img"
                  src={preview}
                  alt="Предпросмотр"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 280,
                    borderRadius: 2,
                    boxShadow: 3,
                    display: 'block',
                    objectFit: 'cover'
                  }}
                />
              )}
              {!isSubmitting && (
                <IconButton
                  size="small"
                  onClick={handleRemove}
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: -12,
                    backgroundColor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { backgroundColor: 'error.50', color: 'error.main' }
                  }}
                  title="Удалить файл"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} МБ)
            </Typography>

            <TextField
              fullWidth
              label="Адрес участка дороги *"
              variant="outlined"
              value={address}
              onChange={handleAddressChange}
              onBlur={handleAddressBlur}
              error={Boolean(addressError)}
              helperText={addressError || 'Укажите улицу и номер дома или ориентир участка'}
              disabled={isSubmitting}
              sx={{ mb: 3, backgroundColor: 'background.paper' }}
              placeholder="Например: ул. Ленина, д. 15"
            />

            {isSubmitting ? (
              <Box sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {progressStage}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="primary">
                    {uploadProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!address.trim()}
                >
                  Начать анализ
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleRemove}
                  color="inherit"
                >
                  Отмена
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};
