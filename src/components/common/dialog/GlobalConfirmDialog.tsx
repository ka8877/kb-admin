import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useConfirmDialogStore } from '@/hooks/useConfirmDialog';

const GlobalConfirmDialog: React.FC = () => {
  const { open, title, message, confirmText, cancelText, severity, confirm, cancel } =
    useConfirmDialogStore();

  const getConfirmButtonColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getCancelButtonStyles = () => {
    const getBorderColor = () => {
      switch (severity) {
        case 'error':
          return '#f44336'; // 에러 색상
        case 'warning':
          return '#ff9800'; // 경고 색상
        default:
          return '#1976d2'; // 기본 primary 색상
      }
    };

    return {
      backgroundColor: '#ffffff',
      color: '#666',
      border: `1px solid ${getBorderColor()}`,
      '&:hover': {
        backgroundColor: '#f5f5f5',
        border: `1px solid ${getBorderColor()}`,
      },
    };
  };

  return (
    <Dialog
      open={open}
      onClose={cancel}
      aria-labelledby="global-confirm-dialog-title"
      aria-describedby="global-confirm-dialog-description"
    >
      <DialogTitle id="global-confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="global-confirm-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancel} color="inherit" sx={getCancelButtonStyles()}>
          {cancelText}
        </Button>
        <Button onClick={confirm} color={getConfirmButtonColor()} variant="contained" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlobalConfirmDialog;
