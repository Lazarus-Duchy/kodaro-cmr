import { AppShell, NavLink } from '@mantine/core';
import { useLocation } from 'react-router-dom';

// Tutaj linki do podstron
const navlinks = [
  { href: 'contacts', label: 'Contacts', description: 'Item with description' },
  { href: 'clients', label: 'Clients' },
  { href: 'marketing', label: 'Marketing', children: [{ href: 'marketing1', label: 'Marketing 1' }, { href: 'marketing2', label: 'Marketing 2', children: [{ href: 'marketing1.1', label: 'Marketing 1.1' }] }] },
  { href: 'reports', label: 'Reports' },
];

// Maksymalny rozmiar rekurencji
const maxStackSize = 9;

const Navbar = ( props ) => {
    const breadcrumbsItems = props.breadcrumbsItems;

    const mapNavLinks = (list, stack = 0, parentHref = '', isParentActive = true) => {
        // Dla bezpieczeństwa
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
                    rightSection={item.rightSection}
                >
                    {item.children && item.children.length > 0? mapNavLinks(item.children, stack + 1, fullHref, isItemActive) : ""}
                </NavLink>
            )
        });
    }

  return (
    <AppShell.Navbar>
        {mapNavLinks(navlinks)}
    </AppShell.Navbar>
  )
}

export default Navbar