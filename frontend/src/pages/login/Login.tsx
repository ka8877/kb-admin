import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { loginKeycloak } from '../../utils/keycloak';

const LoginPage: React.FC = () => {
  const handleLogin = () => {
    loginKeycloak();
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={mainBoxStyle}>
        {/* Logo Area */}
        <Typography component="h1" variant="h4" sx={logoStyle}>
          AI 검색 Admin
        </Typography>

        {/* Login Box */}
        <Paper elevation={0} sx={loginBoxStyle}>
          {/* Tab-like Header */}
          <Box sx={tabStyle}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
              keycloak 로그인
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={contentStyle}>
            <Box sx={infoTextStyle}>
              <Typography variant="body2" color="textSecondary" align="center">
                keycloack 로그인해 주세요.
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              sx={loginButtonStyle}
              disableElevation
            >
              로그인
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;

const mainBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f5f6f7',
} as const;

const logoStyle = {
  mb: 4,
  color: 'black',
  fontWeight: 900,
  letterSpacing: '-1px',
} as const;

const loginBoxStyle = {
  width: '100%',
  border: '1px solid #dadada',
  borderRadius: '6px',
  overflow: 'hidden',
  backgroundColor: '#fff',
} as const;

const tabStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '50px',
  borderBottom: '1px solid #e3e3e3',
  backgroundColor: '#fff',
} as const;

const contentStyle = {
  padding: '40px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
} as const;

const infoTextStyle = {
  mb: 1,
  textAlign: 'center',
} as const;

const loginButtonStyle = {
  height: '50px',
  fontSize: '18px',
  fontWeight: 'bold',
  backgroundColor: '#1976d2',
  color: '#fff',
  border: '1px solid #1976d2',
  '&:hover': {
    backgroundColor: '#115293',
    borderColor: '#115293',
  },
} as const;
