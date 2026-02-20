import { AppShell } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';

import RouterSwitcher from './components/RouterSwitcher/RouterSwitcher';
import Header from './components/Layout/Header/Header.jsx';
import Navbar from './components/Layout/Navbar/Navbar.jsx';
import Footer from './components/Layout/Footer/footer.jsx';
import LoadingScreen from './components/Modals/LoadingScreen/loadingScreen.jsx';
import PathBreadcrumbs from './components/Features/PathBreadcrumbs/PathBreadcrumbs.jsx';
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


const App = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [navbarOpened, { navbarToggle }] = useDisclosure();
  const [section, setSection] = useState({ href: '/', label: "Home" });
  const [pathSteps, setPathSteps] = useState([{ href: '/', label: "Home" }]);

  useEffect(() => {
    let curHref = '';
    let tempPathSteps = [{ href: '/', label: "Home" }];

    location.pathname.split("/").slice(1).forEach(item => {
      if (item !== '') {
        curHref += `/${item}`;
        tempPathSteps.push({ 
          href: curHref, 
          label: item.charAt(0).toUpperCase() + item.slice(1), 
          hrefPart: item 
        });
      }
    });

    setPathSteps(tempPathSteps);
    setSection(tempPathSteps[tempPathSteps.length - 1]);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className='App'>
      <AppShell
        padding="md"
        header={{ height: 60 }}
        footer={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !navbarOpened },
        }}
      >
        <Header burgerOpened={navbarOpened} burgerToogle={navbarToggle} navlinks={navlinks} />
        <Navbar pathSteps={pathSteps} navlinks={navlinks} />
        
        <AppShell.Main>
          {section.href !== '/' && <PathBreadcrumbs pathSteps={pathSteps} />}
          <RouterSwitcher />
        </AppShell.Main>
        
        <Footer />
      </AppShell>
    </div>
  );
}

export default App;