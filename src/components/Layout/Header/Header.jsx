import { useState } from 'react';
import {
  AppShell, Group, Burger, Button, Avatar, Menu, Text, Divider, rem
} from '@mantine/core';
import { IconLogin, IconUserPlus, IconLogout, IconUser, IconSettings } from '@tabler/icons-react';
import { useAuth } from '../../../Context/AuthContext';
import AuthModal from '../../Auth/AuthModal';

const Header = ({ opened, toggle }) => {
  const { isLoggedIn, user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const openLogin = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalTab('register');
    setAuthModalOpen(true);
  };

  return (
    <>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          {/* Left side: burger (only when logged in) + logo */}
          <Group>
            {isLoggedIn && (
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            )}
            <Text fw={700} size="lg" c="clientFlow.4">ClientFlow</Text>
          </Group>

          {/* Right side: auth buttons or user menu */}
          <Group gap="sm">
            {isLoggedIn ? (
              // Logged in: show user avatar + logout button
              <>
                <Menu shadow="md" width={200} radius="md">
                  <Menu.Target>
                    <Avatar
                      src={null}
                      radius="xl"
                      color="clientFlow.4"
                      style={{ cursor: 'pointer' }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>
                      <Text size="xs" fw={600}>{user?.name}</Text>
                      <Text size="xs" c="dimmed">{user?.email}</Text>
                    </Menu.Label>
                    <Menu.Divider />
                    <Menu.Item leftSection={<IconUser style={{ width: rem(14) }} />}>
                      Profil
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconLogout style={{ width: rem(14) }} />}
                      onClick={logout}
                    >
                      Wyloguj się
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>

                <Button
                  variant="light"
                  color="red"
                  radius="md"
                  size="sm"
                  leftSection={<IconLogout size={16} />}
                  onClick={logout}
                >
                  Wyloguj
                </Button>
              </>
            ) : (
              // Not logged in: show login + register buttons
              <>
                <Button
                  variant="subtle"
                  color="clientFlow.4"
                  radius="md"
                  size="sm"
                  leftSection={<IconLogin size={16} />}
                  onClick={openLogin}
                >
                  Zaloguj się
                </Button>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AuthModal
        opened={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Header;