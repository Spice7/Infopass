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
        bgcolor: brandColor,
        color: 'white',
        boxShadow: 3,
        borderRadius: '0 15px 15px 0',
        height: '100vh',
        boxSizing: 'border-box',
        width: 'auto',
        minWidth: 260,
        maxWidth: 320,
        whiteSpace: 'nowrap',
        overflowX: 'hidden',
      }}
    >
      <Typography variant="h5" fontWeight={700} sx={{ mb: 4, letterSpacing: 2 }}>
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
              borderRadius: 2,
              bgcolor: selectedMenu === label ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
              color: 'inherit',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
