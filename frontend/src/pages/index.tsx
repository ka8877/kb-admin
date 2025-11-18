import type React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { AutoAwesome, Coffee, Rocket } from '@mui/icons-material';

const HomePage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      <Stack spacing={4} alignItems="center">
        {/* 메인 아이콘 */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 0%, #1e88e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                },
                '50%': {
                  transform: 'scale(1.05)',
                },
              },
            }}
          >
            <AutoAwesome sx={{ fontSize: 60, color: '#fff' }} />
          </Box>
        </Box>

        {/* 타이틀 */}
        <Stack spacing={1} alignItems="center">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1976d2 0%, #1e88e5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI 검색 Admin
          </Typography>
        </Stack>

        {/* 하단 텍스트 */}
        <Typography variant="caption" color="text.disabled" sx={{ mt: 4 }}>
          UI: MUI v5 • State: Zustand • Data: React Query • Build: Vite • Router: react-router-dom +
          파일 기반
        </Typography>
      </Stack>
    </Box>
  );
};

export default HomePage;
