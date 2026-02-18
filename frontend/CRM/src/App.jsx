import { Anchor, AppShell, Breadcrumbs } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom'

import RouterSwitcher from './components/RouterSwitcher/RouterSwitcher';
import { useDisclosure } from '@mantine/hooks';

import Header from './components/Layout/Header/Header.jsx';
import Navbar from './components/Layout/Navbar/Navbar.jsx';
import Footer from './components/Layout/Footer/footer.jsx';

const App = () => {
  const location = useLocation();
  const breadcrumbsItems = [ { href: '/', label: "Home" } ];
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();

  let curHref = '';
  location.pathname.split("/").slice(1).forEach(item => {
    if (item !== '') {
      curHref += `/${item}`;
      breadcrumbsItems.push( { href: curHref, label: item.charAt(0).toUpperCase() + item.slice(1), hrefPart: item } )
    }
  });

  
  return (
    <div className='App' >
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
          <Breadcrumbs separator=">">
            {breadcrumbsItems.map((item, index) => (
              <Anchor href={item.href} key={index}>
                {item.label}
              </Anchor>
            ))}
          </Breadcrumbs>
          <RouterSwitcher />
        </AppShell.Main>
        <Footer />
      </AppShell>
    </div>
  )
}

export default App