import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'clientFlow',
  colors: {
    clientFlow: [
      '#e1f0ef', '#c3e2e0', '#a1d2cf', '#7bc2be', '#54b2ad', 
      '#3a9691', '#2d7571', '#1f5451', '#123432', '#061716'
    ],
  },
  components: {
    AppShell: {
      styles: (theme) => ({
        header: {
          backdropFilter: 'blur(10px)',
          zIndex: 100,
        },
      }),
    },
    Button: {
      vars: (theme, props) => {
        if (props.variant === 'strong') {
          return {
            root: {
              '--button-bg': 'var(--mantine-color-clientFlow-4)',
              '--button-hover': 'var(--mantine-color-clientFlow-5)',
              '--button-color': 'var(--mantine-color-white)',
            },
          };
        }
        return { root: {} };
      },
    },
    TextInput: {
      styles: (theme) => ({
        input: {
          borderRadius: rem(20),
          transition: 'border-color 0.2s ease',
          '&:focus': {
            borderColor: 'var(--mantine-color-clientFlow-3)',
          },
        },
      }),
    },
  },
});