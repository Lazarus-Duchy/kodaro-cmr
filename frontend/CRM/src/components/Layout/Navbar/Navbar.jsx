import { AppShell, NavLink, Text, Avatar, Group, Box, Badge, Divider, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { 
  IconUsers, 
  IconAddressBook, 
  IconChartBar, 
  IconSpeakerphone, 
  IconPoint, 
  IconSettings, 
  IconLogout,
  IconSun,
  IconMoonStars 
} from '@tabler/icons-react';

const maxStackSize = 9;

const Navbar = ({ pathSteps, navlinks }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const mapNavLinks = (list, stack = 0, parentHref = '', isParentActive = true) => {
    if (stack > maxStackSize) {
      console.warn(`Stack reached it's limit! (${maxStackSize})`);
      return;
    }

    return list.map((item, index) => {
      const fullHref = `${parentHref}/${item.href}`;
      const isItemActive = isParentActive && pathSteps.length > stack + 1 && pathSteps[stack + 1].hrefPart == item.href;

      return (
        <NavLink
          href={fullHref}
          key={index}
          active={isItemActive}
          label={item.label}
          description={item.description}
          leftSection={item.icon}
          rightSection={item.badge && <Badge size="xs" variant="filled" color="red">{item.badge}</Badge>}
          pl={stack > 0 ? stack * 20 : 12}
          py={10}
          styles={{
            root: {
              borderRadius: '8px',
              marginBottom: '4px',
              transition: 'all 0.2s ease',
            },
            label: {
              fontWeight: isItemActive ? 600 : 500,
              fontSize: '14px',
            },
            description: { fontSize: '11px' }
          }}
          variant="light"
          color="clientFlow.4"
          defaultOpened={isItemActive}
        >
          {item.children && item.children.length > 0 ? mapNavLinks(item.children, stack + 1, fullHref, isItemActive) : ""}
        </NavLink>
      );
    });
  };

  return (
    <AppShell.Navbar p="sm" style={{ display: 'flex', flexDirection: 'column' }}>
      <AppShell.Section grow>
        {navlinks.map((section, idx) => (
          <Box key={idx} mb="lg">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs" pl="sm">
              {section.header}
            </Text>
            {mapNavLinks(section.links)}
          </Box>
        ))}
      </AppShell.Section>

      <AppShell.Section>
        <Divider my="sm" />

        <Group justify="space-between" px="xs" mb="xs">
          <Text size="xs" c="dimmed" fw={500}>Appearance</Text>
          <ActionIcon 
            onClick={() => toggleColorScheme()} 
            variant="default" 
            size="sm" 
            radius="md"
            title="Toggle color scheme"
          >
            {isDark ? <IconSun size={16} /> : <IconMoonStars size={16} />}
          </ActionIcon>
        </Group>

        <NavLink
          label="Settings"
          leftSection={<IconSettings size={20} stroke={1.5} />}
          styles={{ root: { borderRadius: '8px' } }}
        />

        <Box mt="md" p="xs" style={{ 
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa', 
          borderRadius: '12px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent'
        }}>
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm">
              <Avatar src={null} radius="xl" color="clientFlow.4">JD</Avatar>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>John Doe</Text>
                <Text size="xs" c="dimmed">Admin</Text>
              </div>
            </Group>
            <ActionIcon variant="subtle" color="red" title="Logout">
              <IconLogout size={18} />
            </ActionIcon>
          </Group>
        </Box>
      </AppShell.Section>
    </AppShell.Navbar>
  );
};

export default Navbar;