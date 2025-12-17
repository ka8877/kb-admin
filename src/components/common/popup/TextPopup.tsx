import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

interface TextPopupProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  content: string;
}

const TextPopup: React.FC<TextPopupProps> = ({ open, onClose, title = '상세 정보', content }) => {
  let formattedContent = content;
  try {
    // Try to parse and format if it's JSON
    const json = JSON.parse(content);
    formattedContent = JSON.stringify(json, null, 2);
  } catch (e) {
    // If not JSON, keep as is
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {title}
        <IconButton aria-label="close" onClick={onClose} sx={iconStyle}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="pre" sx={style}>
          {formattedContent}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TextPopup;

const style = {
  backgroundColor: '#f5f5f5',
  padding: '16px',
  borderRadius: '4px',
  overflowX: 'auto',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  margin: 0,
};

const iconStyle = {
  position: 'absolute',
  right: 8,
  top: 8,
  color: 'grey.500',
};
