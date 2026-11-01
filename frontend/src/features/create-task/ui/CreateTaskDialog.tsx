import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Grow
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useData } from '../../../entities/model/DataContext';
import { TaskStatus } from '../../../entities/task/model/types';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  defaultPhotoId?: string;
  defaultAddress?: string;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onClose,
  defaultPhotoId,
  defaultAddress = ''
}) => {
  const { photos, addTask } = useData();

  const [photoId, setPhotoId] = useState<string>(defaultPhotoId || (photos[0]?.id ?? ''));
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>(defaultAddress);
  const [status, setStatus] = useState<TaskStatus>('open');

  // Ошибки валидации
  const [descError, setDescError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ desc: boolean; address: boolean }>({
    desc: false,
    address: false
  });

  useEffect(() => {
    if (open) {
      if (defaultPhotoId) {
        setPhotoId(defaultPhotoId);
      } else if (photos.length > 0 && !photoId) {
        setPhotoId(photos[0].id);
      }
      setAddress(defaultAddress);
      setDescription('');
      setStatus('open');
      setDescError(null);
      setAddressError(null);
      setTouched({ desc: false, address: false });
    }
  }, [open, defaultPhotoId, defaultAddress, photos, photoId]);

  // При смене выбранного фото, если адрес пуст, подставляем адрес фото
  const handlePhotoChange = (newPhotoId: string) => {
    setPhotoId(newPhotoId);
    const selectedPhoto = photos.find(p => p.id === newPhotoId);
    if (selectedPhoto?.address && !address) {
      setAddress(selectedPhoto.address);
    }
  };

  const validateDescription = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setDescError('Описание работ обязательно.');
      return false;
    }
    if (trimmed.length < 5) {
      setDescError('Описание должно содержать не менее 5 символов.');
      return false;
    }
    if (trimmed.length > 500) {
      setDescError('Описание не должно превышать 500 символов.');
      return false;
    }
    setDescError(null);
    return true;
  };

  const validateAddressField = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setAddressError('Адрес обязателен для формирования ремонтного задания.');
      return false;
    }
    if (trimmed.length < 3) {
      setAddressError('Адрес должен содержать не менее 3 символов.');
      return false;
    }
    setAddressError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ desc: true, address: true });

    const isDescValid = validateDescription(description);
    const isAddrValid = validateAddressField(address);

    if (!isDescValid || !isAddrValid || !photoId) {
      return;
    }

    addTask({
      photoId,
      description: description.trim(),
      address: address.trim(),
      status
    });

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Grow}
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'primary.50',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <AssignmentIcon />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Новое задание на ремонт
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Сформируйте наряд для дорожных служб
          </Typography>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            select
            fullWidth
            label="Связанный снимок (источник) *"
            value={photoId}
            onChange={e => handlePhotoChange(e.target.value)}
            disabled={Boolean(defaultPhotoId)}
            helperText={
              defaultPhotoId
                ? 'Снимок зафиксирован из карточки анализа'
                : 'Выберите снимок с выявленным дефектом'
            }
          >
            {photos.map(p => (
              <MenuItem key={p.id} value={p.id}>
                Снимок #{p.id.toUpperCase()} ({p.address || 'Без адреса'})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Описание ремонтных работ *"
            placeholder="Например: Восстановление сплошной полосы разметки краской со световозвращающими шариками"
            value={description}
            onChange={e => {
              setDescription(e.target.value);
              if (touched.desc) validateDescription(e.target.value);
            }}
            onBlur={() => {
              setTouched(prev => ({ ...prev, desc: true }));
              validateDescription(description);
            }}
            error={Boolean(descError)}
            helperText={descError || 'Опишите характер дефекта и требуемые работы (минимум 5 симв.)'}
          />

          <TextField
            fullWidth
            label="Адрес проведения работ *"
            placeholder="Например: ул. Ленина, д. 15"
            value={address}
            onChange={e => {
              setAddress(e.target.value);
              if (touched.address) validateAddressField(e.target.value);
            }}
            onBlur={() => {
              setTouched(prev => ({ ...prev, address: true }));
              validateAddressField(address);
            }}
            error={Boolean(addressError)}
            helperText={addressError || 'Точное местоположение участка дороги'}
          />

          <TextField
            select
            fullWidth
            label="Начальный статус"
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
          >
            <MenuItem value="open">Открыто (требует распределения)</MenuItem>
            <MenuItem value="in_progress">В работе (бригада направлена)</MenuItem>
            <MenuItem value="completed">Выполнено (разметка нанесена)</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} color="inherit" variant="outlined">
            Отмена
          </Button>
          <Button type="submit" variant="contained">
            Создать задание
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
