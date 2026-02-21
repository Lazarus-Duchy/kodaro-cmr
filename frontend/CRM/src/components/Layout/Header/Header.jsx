import { 
  AppShell, Burger, Flex, TextInput, Image, Button, Group, 
  Modal, Stack, Text, Divider, PasswordInput, Progress, Box 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/ClientFlow.png';


const Header = ({ opened, toggle }) => {
  const navigate = useNavigate();
  const [loginOpened, { open: openLogin, close: closeLogin }] = useDisclosure(false);
  const [regOpened, { open: openReg, close: closeReg }] = useDisclosure(false);
  const [password, setPassword] = useState('');

  const getStrength = (pass) => {
    let s = 0;
    if (pass.length > 5) s += 25;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) s += 25;
    if (/\d/.test(pass)) s += 25;
    if (/[^a-zA-Z\d]/.test(pass)) s += 25;
    return s;
  };

  const strength = getStrength(password);
  const strengthColor = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

  return (
    <>
      <AppShell.Header p="md">
        <Flex align="center" justify="space-between" h="100%">
          <Flex align="center" gap="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Box 
              onClick={() => navigate('/')} 
              style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Image src={logo} alt="Logo" h={140} w="auto" />
            </Box>
          </Flex>

          <TextInput 
            placeholder="Search..." 
            style={{ flex: 1, maxWidth: 400 }} 
            mx="md"
          />

          <Group gap="sm">
            <Button variant="strong" onClick={openLogin}>Login</Button>
            <Button variant="strong" onClick={openReg}>Register</Button>
          </Group>
        </Flex>
      </AppShell.Header>

      <Modal opened={loginOpened} onClose={closeLogin} centered radius="md" title={<Text fw={700} size="lg">Welcome back</Text>}>
        <Stack>
          <Text size="sm" c="dimmed" ta="center">Use your ClientFlow account</Text>
          <TextInput label="Email" placeholder="your@email.com" radius="md" withAsterisk />
          <PasswordInput label="Password" placeholder="********" radius="md" withAsterisk />
          <Button variant="strong" fullWidth mt="md">Login</Button>
        </Stack>
      </Modal>

      <Modal opened={regOpened} onClose={closeReg} centered radius="md" title={<Text fw={700} size="lg">Create account</Text>}>
        <Stack>
          <Flex gap="sm">
            <TextInput label="First name" placeholder="John" style={{ flex: 1 }} />
            <TextInput label="Last name" placeholder="Doe" style={{ flex: 1 }} />
          </Flex>
          <TextInput label="Email" placeholder="your@email.com" withAsterisk />
          <Box>
            <PasswordInput 
              label="Password" 
              value={password} 
              onChange={(e) => setPassword(e.currentTarget.value)} 
              withAsterisk 
            />
            <Progress color={strengthColor} value={strength} size={5} mt="xs" />
            <Text size="xs" c="dimmed" mt={5}>Strength: {strength}%</Text>
          </Box>
          <Button variant="strong" fullWidth mt="md">Sign up</Button>
        </Stack>
      </Modal>
    </>
  );
}

export default Header;