import React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { AccountCircle, NoteAlt, History, HelpOutline } from '@mui/icons-material';

const brandColor = '#1976d2';

const menuItems = [
  { label: '내 정보', icon: <AccountCircle /> },
  { label: '오답노트', icon: <NoteAlt /> },
  { label: '게임 기록', icon: <History /> },
  { label: '문의 내역', icon: <HelpOutline /> },
];

const Sidebar = ({ selectedMenu, setSelectedMenu }) => {
  return (
    <Box
      component="nav"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        bgcolor: '#fff',
        borderRadius: '0 20px 20px 0',
        height: '80vh',
        boxSizing: 'border-box',
        width: 'auto',
        minWidth: 260,
        maxWidth: 320,
        whiteSpace: 'nowrap',
        overflowX: 'hidden',

        // 외부 그림자 (떴다 느낌)
        boxShadow: `
          0 4px 8px rgba(25, 118, 210, 0.15),
          0 12px 24px rgba(25, 118, 210, 0.25)
        `,
        // 내부 음영 (입체감 + 깊이감)
        border: `2px solid transparent`,
        backgroundClip: 'padding-box',
        position: 'relative',

        // 2중 테두리 구현 위한 before 가상요소
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 2,
          left: 2,
          right: 2,
          bottom: 2,
          borderRadius: '0 18px 18px 0',
          border: `1px solid ${brandColor}33`,
          pointerEvents: 'none',
        },
      }}
    >
      <Typography
        variant="h5"
        fontWeight={900}
        sx={{ mb: 5, letterSpacing: 3, color: brandColor }}
      >
        My Page
      </Typography>
      <List>
        {menuItems.map(({ label, icon }) => (
          <ListItemButton
            key={label}
            onClick={() => setSelectedMenu(label)}
            selected={selectedMenu === label}
            sx={{
              mb: 1,
              borderRadius: 3,
              bgcolor: selectedMenu === label ? `${brandColor}22` : 'transparent',
              color: selectedMenu === label ? brandColor : brandColor + 'cc',
              fontWeight: selectedMenu === label ? 700 : 500,
              boxShadow: selectedMenu === label
                ? `0 4px 10px rgba(25, 118, 210, 0.3), inset 0 0 6px rgba(255, 255, 255, 0.3)`
                : 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: `${brandColor}15`,
                boxShadow: `0 6px 14px rgba(25, 118, 210, 0.35), inset 0 0 8px rgba(255, 255, 255, 0.35)`,
                transform: 'scale(1.05)',
                color: brandColor,
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40, fontSize: 28 }}>
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={label}
              primaryTypographyProps={{ fontWeight: 'inherit', fontSize: 16 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
