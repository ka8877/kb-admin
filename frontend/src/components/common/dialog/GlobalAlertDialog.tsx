// frontend/src/components/common/dialog/GlobalAlertDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Alert,
  AlertTitle,
  Box,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAlertDialog, type AlertSeverity } from '../../../hooks/useAlertDialog';

// 아이콘 매핑
const severityIcons = {
  success: <SuccessIcon color="success" />,
  info: <InfoIcon color="info" />,
  warning: <WarningIcon color="warning" />,
  error: <ErrorIcon color="error" />,
};

// 색상 매핑
const severityColors: Record<AlertSeverity, 'success' | 'info' | 'warning' | 'error'> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
};

const GlobalAlertDialog: React.FC = () => {
  const { isOpen, title, message, severity, confirmText, confirm, hideAlert } = useAlertDialog();

  const handleConfirm = () => {
    confirm();
  };

  const handleClose = () => {
    hideAlert();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {severityIcons[severity]}
          {title}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity={severityColors[severity]} sx={{ mb: 2 }}>
          <AlertTitle sx={{ mt: 0 }}>
            {severity === 'success' && '성공'}
            {severity === 'info' && '정보'}
            {severity === 'warning' && '주의'}
            {severity === 'error' && '오류'}
          </AlertTitle>
          <DialogContentText
            id="alert-dialog-description"
            component="div"
            sx={{ color: 'inherit', mt: 1 }}
          >
            {message}
          </DialogContentText>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={severityColors[severity]}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlobalAlertDialog;
