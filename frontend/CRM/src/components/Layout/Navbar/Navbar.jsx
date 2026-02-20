import { AppShell, NavLink, Text, Avatar, Group, Box, Badge, Divider, ActionIcon } from '@mantine/core';
import { 
  IconUsers, 
  IconAddressBook, 
  IconChartBar, 
  IconSpeakerphone, 
  IconPoint, 
  IconSettings, 
  IconLogout 
} from '@tabler/icons-react';
const navlinks = [
  { 
    header: 'Main', 
    links: [
      { href: 'contacts', label: 'Contacts', description: 'Manage your leads', icon: <IconAddressBook size={20} stroke={1.5} />,},
      { href: 'clients', label: 'Clients', icon: <IconUsers size={20} stroke={1.5} /> },
    ]
  },
  {
    header: 'Tools',
    links: [
      { 
        href: 'marketing', 
        label: 'Marketing', 
        icon: <IconSpeakerphone size={20} stroke={1.5} />,
        children: [
          { href: 'marketing1', label: 'Campaigns', icon: <IconPoint size={14} /> }, 
          { 
            href: 'marketing2', 
            label: 'Analytics', 
            icon: <IconPoint size={14} />,
            children: [{ href: 'marketing1.1', label: 'Social Media', icon: <IconPoint size={14} /> }] 
          }
        ] 
      },
      { href: 'reports', label: 'Reports', icon: <IconChartBar size={20} stroke={1.5} /> },
    ]
  }
];

const maxStackSize = 9;

const Navbar = (props) => {
  const breadcrumbsItems = props.breadcrumbsItems;

  const mapNavLinks = (list, stack = 0, parentHref = '', isParentActive = true) => {
    if (stack > maxStackSize) {
      console.warn(`Stack reached it's limit! (${maxStackSize})`);
      return;
    }

    return list.map((item, index) => {
      const fullHref = `${parentHref}/${item.href}`;
      const isItemActive = isParentActive && breadcrumbsItems.length > stack + 1 && breadcrumbsItems[stack + 1].hrefPart == item.href;

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

        <NavLink
          label="Settings"
          leftSection={<IconSettings size={20} stroke={1.5} />}
          styles={{ root: { borderRadius: '8px' } }}
        />

        <Box mt="md" p="xs" style={{ 
          background: '#f8f9fa', 
          borderRadius: '12px' 
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