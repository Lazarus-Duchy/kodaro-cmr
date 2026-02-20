import { Anchor, AppShell, Breadcrumbs } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';

import RouterSwitcher from './components/RouterSwitcher/RouterSwitcher';
import Header from './components/Layout/Header/Header.jsx';
import Navbar from './components/Layout/Navbar/Navbar.jsx';
import Footer from './components/Layout/Footer/footer.jsx';
import LoadingScreen from './components/Modals/LoadingScreen/loadingScreen.jsx';
import PathBreadcrumbs from './components/Features/PathBreadcrumbs/PathBreadcrumbs.jsx';

const App = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [navbarOpened, { toggle }] = useDisclosure();
  const [section, setSection] = useState({ href: '/', label: "Home" });
  const [pathSteps, setPathSteps] = useState([{ href: '/', label: "Home" }]);

  useEffect(() => {
    let curHref = '';
    let tempPathSteps = [{ href: '/', label: "Home" }];

    location.pathname.split("/").slice(1).forEach(item => {
        if (item !== '') {
          curHref += `/${item}`;
          tempPathSteps.push({ href: curHref, label: item.charAt(0).toUpperCase() + item.slice(1), hrefPart: item });
        }
    });

    setPathSteps(tempPathSteps.slice());
    setSection(tempPathSteps[tempPathSteps.length - 1]);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className='App'>
      <AppShell
        padding="md"
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !navbarOpened },
        }}
      >
        <Header opened={navbarOpened} toggle={toggle} />
        <Navbar pathSteps={pathSteps} />
        
        <AppShell.Main>
          {section.href != '/' && <PathBreadcrumbs pathSteps={pathSteps} />}
          <RouterSwitcher />
        </AppShell.Main>
        
        <Footer />
      </AppShell>
    </div>
  );
}

export default App;