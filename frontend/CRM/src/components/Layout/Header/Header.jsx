import { AppShell, Burger, Flex, TextInput, Image, Button, Group, Modal, Stack, Text, Divider, PasswordInput, Progress } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import logo from '../../../assets/ClientFlow.png';
import "../Header/header.css";

const Header = (props) => {
  const [loginOpened, { open: openLogin, close: closeLogin }] = useDisclosure(false);
  const [regOpened, { open: openReg, close: closeReg }] = useDisclosure(false);
  const [password, setPassword] = useState('');

  const getStrength = (password) => {
    let strength = 0;
    if (password.length > 5) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;
    return strength;
  };

  const strength = getStrength(password);
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

  const googleButtonStyle = {
    root: {
      backgroundColor: '#fff',
      color: '#747a80',
      border: '1px solid #dadce0',
      '&:hover': { backgroundColor: '#f8f9fa' }
    }
  };

  return (
    <>
      <AppShell.Header p="md">
        <Flex align="center" justify="space-between" h="100%">
          <Flex align="center" gap="md">
            <Burger opened={props.opened} onClick={props.toggle} hiddenFrom="sm" size="sm" />
            <div className="logo-container">
              <Image src={logo} alt="ClientFlow Logo" h={140} w="auto" />
            </div>
          </Flex>

          <TextInput 
            className="search-input" 
            placeholder="Search..." 
            style={{ flex: 1, maxWidth: 400 }} 
            mx="md" 
          />

          <Group gap="sm">
            <Button variant="subtle" color="clientFlow.4" onClick={openLogin}>Login</Button>
            <Button color="clientFlow.4"variant="subtle" radius="xl" onClick={openReg}>Register</Button>
          </Group>
        </Flex>
      </AppShell.Header>

      <Modal opened={loginOpened} onClose={closeLogin} >
        <Stack>
          <Text size="xl" fw={700} ta="center">Welcome back</Text>
          <Text size="sm" c="dimmed" ta="center" mb="md">Use your ClientFlow account</Text>
          <TextInput label="Email" placeholder="your@email.com" radius="md" withAsterisk />
          <PasswordInput label="Password" placeholder="********" radius="md" withAsterisk />
          <Button color="clientFlow.5" variant='strong'fullWidth mt="md" radius="md">Login</Button>
          <Divider label="OR" labelPosition="center" my="md" />
          <Button variant="default" fullWidth radius="md" styles={googleButtonStyle}>
            Sign in with Google
          </Button>
        </Stack>
      </Modal>

      <Modal opened={regOpened} onClose={closeReg}>
        <Stack>
          <Text size="xl" fw={700} ta="center">Create account</Text>
          <Text size="sm" c="dimmed" ta="center" mb="md">Join the ClientFlow community</Text>
          
          <Flex gap="sm">
            <TextInput label="First name" placeholder="John" style={{ flex: 1 }} radius="md" />
            <TextInput label="Last name" placeholder="Doe" style={{ flex: 1 }} radius="md" />
          </Flex>
          
          <TextInput label="Email" placeholder="your@email.com" radius="md" withAsterisk />
          
          <div>
            <PasswordInput 
              label="Password" 
              value={password} 
              onChange={(event) => setPassword(event.currentTarget.value)} 
              placeholder="Your password" 
              radius="md" 
              withAsterisk 
            />
            <Progress color={color} value={strength} size={5} mt="xs" transitionDuration={200} />
            <Text size="xs" c="dimmed" mt={5}>
              Strength: {strength}% {strength === 100 && '— Strong!'}
            </Text>
          </div>
          
          <Button color="clientFlow.5" variant='strong' fullWidth mt="md" radius="md">Sign up</Button>
        </Stack>
      </Modal>
    </>
  );
}

export default Header;