import { AppShell, Text, Center } from '@mantine/core';


const Footer = () => {
  return (
    <AppShell.Footer p="md">
      <Center>
        <Text size="sm" c="dimmed">
          Built by Księstwo Lazarusa with &lt;3
        </Text>
      </Center>
    </AppShell.Footer>
  );
}

export default Footer;