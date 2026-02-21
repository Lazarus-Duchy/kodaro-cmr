import { Anchor, AppShell, Breadcrumbs } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';


import RouterSwitcher from './components/RouterSwitcher/RouterSwitcher';
import Header from './components/Layout/Header/Header.jsx';
import Navbar from './components/Layout/Navbar/Navbar.jsx';
import Footer from './components/Layout/Footer/footer.jsx';
import LoadingScreen from './components/Modals/LoadingScreen/loadingScreen.jsx';

const App = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();

  const breadcrumbsItems = [{ href: '/', label: "Home" }];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  let curHref = '';
  location.pathname.split("/").slice(1).forEach(item => {
    if (item !== '') {
      curHref += `/${item}`;
      breadcrumbsItems.push({ 
        href: curHref, 
        label: item.charAt(0).toUpperCase() + item.slice(1), 
        hrefPart: item 
      });
    }
  });

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
          collapsed: { mobile: !opened },
        }}
      >
        <Header opened={opened} toggle={toggle} />
        <Navbar breadcrumbsItems={breadcrumbsItems} />
        
        <AppShell.Main>
          <Breadcrumbs separator=">" mb="md">
            {breadcrumbsItems.map((item, index) => (
              <Anchor 
                key={index} 
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href);
                }}
                style={{ cursor: 'pointer' }}
              >
                {item.label}
              </Anchor>
            ))}
          </Breadcrumbs>
          <RouterSwitcher />
        </AppShell.Main>
        
        <Footer />
      </AppShell>
    </div>
  );
}

export default App;