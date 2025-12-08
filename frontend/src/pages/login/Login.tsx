import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

const LoginPage: React.FC = () => {
  const handleLogin = () => {
    // TODO: Keycloak 로그인 URL로 리다이렉트
    // window.location.href = 'YOUR_KEYCLOAK_LOGIN_URL';
    console.log('Redirect to Keycloak Login');
    alert('Keycloak 로그인 페이지로 이동합니다.');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            KABANG Admin
          </Typography>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            sx={{ mt: 1, mb: 2 }}
          >
            로그인
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
