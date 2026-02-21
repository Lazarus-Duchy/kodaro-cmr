import { useState } from 'react';
import {
  Modal, TextInput, PasswordInput, Button, Stack, Text, Divider,
  Group, Anchor, Alert, Box, Title
} from '@mantine/core';
import { IconAlertCircle, IconLogin, IconUserPlus } from '@tabler/icons-react';
import { useAuth } from '../../Context/AuthContext';

const AuthModal = ({ opened, onClose, defaultTab = 'login' }) => {
  const { login, register, validateLogin } = useAuth();
  const [tab, setTab] = useState(defaultTab);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const resetForms = () => {
    setError('');
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirm('');
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) {
      setError('Wypełnij wszystkie pola.');
      return;
    }
    setLoading(true);
    try {
      validateLogin(loginEmail, loginPassword);
      resetForms();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setError('Wypełnij wszystkie pola.');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Hasła nie są identyczne.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków.');
      return;
    }
    setLoading(true);
    try {
      register({ name: regName, email: regEmail, password: regPassword });
      resetForms();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => { resetForms(); onClose(); }}
      centered
      size="sm"
      radius="lg"
      title={
        <Group gap="xs">
          {tab === 'login' ? <IconLogin size={20} /> : <IconUserPlus size={20} />}
          <Title order={4}>{tab === 'login' ? 'Zaloguj się' : 'Utwórz konto'}</Title>
        </Group>
      }
    >
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" radius="md">
          {error}
        </Alert>
      )}

      {tab === 'login' ? (
        <form onSubmit={handleLogin}>
          <Stack gap="sm">
            <TextInput
              label="Email"
              placeholder="twoj@email.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              radius="md"
              required
            />
            <PasswordInput
              label="Hasło"
              placeholder="Twoje hasło"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              radius="md"
              required
            />
            <Button
              type="submit"
              fullWidth
              color="clientFlow.4"
              radius="md"
              mt="xs"
              loading={loading}
              leftSection={<IconLogin size={16} />}
            >
              Zaloguj się
            </Button>
          </Stack>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <Stack gap="sm">
            <TextInput
              label="Imię i nazwisko"
              placeholder="Jan Kowalski"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              radius="md"
              required
            />
            <TextInput
              label="Email"
              placeholder="twoj@email.com"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              radius="md"
              required
            />
            <PasswordInput
              label="Hasło"
              placeholder="Minimum 6 znaków"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              radius="md"
              required
            />
            <PasswordInput
              label="Potwierdź hasło"
              placeholder="Powtórz hasło"
              value={regConfirm}
              onChange={(e) => setRegConfirm(e.target.value)}
              radius="md"
              required
            />
            <Button
              type="submit"
              fullWidth
              color="clientFlow.4"
              radius="md"
              mt="xs"
              loading={loading}
              leftSection={<IconUserPlus size={16} />}
            >
              Zarejestruj się
            </Button>
          </Stack>
        </form>
      )}

      <Divider my="md" label="lub" labelPosition="center" />

      <Box ta="center">
        {tab === 'login' ? (
          <Text size="sm" c="dimmed">
            Nie masz konta?{' '}
            <Anchor size="sm" color="clientFlow.4" onClick={() => switchTab('register')} style={{ cursor: 'pointer' }}>
              Zarejestruj się
            </Anchor>
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            Masz już konto?{' '}
            <Anchor size="sm" color="clientFlow.4" onClick={() => switchTab('login')} style={{ cursor: 'pointer' }}>
              Zaloguj się
            </Anchor>
          </Text>
        )}
      </Box>
    </Modal>
  );
};

export default AuthModal;
