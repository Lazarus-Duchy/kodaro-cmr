import { Box, Text, Stack, useMantineTheme, useMantineColorScheme } from "@mantine/core";

const LoadingScreen = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 9999,
        backgroundColor: isDark ? theme.colors.dark[7] : theme.white
      }}
    >
      <Stack align="center" gap="xl">
        <Box
          style={{
            width: 60, height: 60, borderRadius: '50%',
            border: `6px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
            borderTopColor: theme.colors.blue[6],
            animation: 'spin 0.8s infinite linear'
          }}
        />
        <Text size="xl" fw={800} style={{ letterSpacing: -1 }}>
          Client<span style={{ color: theme.colors.yellow[6] }}>Flow</span>
        </Text>
        <Box style={{ width: 140, height: 3, backgroundColor: isDark ? theme.colors.dark[4] : theme.colors.gray[1], borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
          <Box style={{ position: 'absolute', width: '60%', height: '100%', background: `linear-gradient(90deg, ${theme.colors.blue[6]}, ${theme.colors.yellow[6]})`, animation: 'progress 1.5s infinite ease-in-out' }} />
        </Box>
        <style>
          {`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes progress { 0% { left: -60%; } 100% { left: 100%; } }
          `}
        </style>
      </Stack>
    </Box>
  );
};

export default LoadingScreen;