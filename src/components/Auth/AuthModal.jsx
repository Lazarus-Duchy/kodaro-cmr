import { useState } from 'react';
import {
  Modal, TextInput, PasswordInput, Button, Stack,
  Alert, Title, Group,
} from '@mantine/core';
import { IconAlertCircle, IconLogin } from '@tabler/icons-react';
import { useAuth } from '../../Context/AuthContext';

const AuthModal = ({ opened, onClose }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      reset();
      onClose();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => { reset(); onClose(); }}
      centered
      size="sm"
      radius="lg"
      title={
        <Group gap="xs">
          <IconLogin size={20} />
          <Title order={4}>Sign in</Title>
        </Group>
      }
    >
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" radius="md">
          {error}
        </Alert>
      )}

      <form onSubmit={handleLogin}>
        <Stack gap="sm">
          <TextInput
            label="Email"
            placeholder="john@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            radius="md"
            required
            autoFocus
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Sign in
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default AuthModal;