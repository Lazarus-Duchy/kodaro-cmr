import { AppShell, Burger, Flex, TextInput } from '@mantine/core';

const Header = ( props ) => {

  return (
    <AppShell.Header>
        <Burger
            opened={props.opened}
            onClick={props.toggle}
            hiddenFrom="sm"
            size="sm"
        />

        <Flex>
            <div>logo</div>
            <TextInput 
            placeholder="Search"
            />
        </Flex>
    </AppShell.Header>
  )
}

export default Header