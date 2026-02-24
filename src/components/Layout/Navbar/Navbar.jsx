import { AppShell, NavLink, Text, Group, Box, Badge, Divider, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { 
  IconUsers, 
  IconAddressBook, 
  IconChartBar, 
  IconSpeakerphone, 
  IconSettings, 
  IconSun,
  IconMoonStars, 
  IconShoppingCart,
  IconAxe,
  IconPhoneCall,
  IconHeadset
} from '@tabler/icons-react';

const navlinks = [
  { 
    header: 'People', 
    links: [
      { href: 'contacts', label: 'Contacts', description: 'Manage your teams', icon: <IconAddressBook size={20} stroke={1.5} /> },
      { href: 'clients',  label: 'Survivors',                                     icon: <IconUsers size={20} stroke={1.5} />        },
    ]
  },
  {
    header: 'Rescue Operations',
    links: [
      { href: 'campaigns', label: 'Campaigns', description: 'Manage your rescue campaigns', icon: <IconHeadset size={20} stroke={1.5} /> },
      { href: 'reports', label: 'Reports', icon: <IconChartBar size={20} stroke={1.5} />   },
      { href: 'equipment',   label: 'Equipment',   icon: <IconAxe size={20} stroke={1.5} /> },
      { href: 'emergency-calls',   label: 'Emergency Calls',   icon: <IconPhoneCall size={20} stroke={1.5} /> },
    ]
  },
];

const maxStackSize = 9;

const Navbar = ({ pathSteps }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const mapNavLinks = (list, stack = 0, parentHref = '', isParentActive = true) => {
    if (stack < 0) stack = 0;
    if (stack > maxStackSize) {
      console.warn(`Stack reached it's limit! (${maxStackSize})`);
      return;
    }

    return list.map((item, index) => {
      const fullHref    = `${parentHref}/${item.href}`;
      const isItemActive = isParentActive && pathSteps.length > stack + 1 && pathSteps[stack + 1].hrefPart === item.href;

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
            description: { fontSize: '11px' },
          }}
          variant="light"
          color="clientFlow.4"
          defaultOpened={isItemActive}
        >
          {item.children?.length ? mapNavLinks(item.children, stack + 1, fullHref, isItemActive) : ''}
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
      </AppShell.Section>
    </AppShell.Navbar>
  );
};

export default Navbar;