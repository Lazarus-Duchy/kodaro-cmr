import { Container, Title, Text, Button, Group, Stack, Grid, Paper, ThemeIcon, rem } from '@mantine/core';
import { IconRocket, IconChartBar, IconUsers, IconShieldCheck } from '@tabler/icons-react';

const Home = () => {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack align="center" ta="center" gap="md" py={50}>
          <Title 
            order={1} 
            size={rem(48)} 
            style={{ 
              background: 'linear-gradient(45deg, #88c9c5, #ebc78c)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}
          >
            Manage Your Business with ClientFlow
          </Title>
          <Text size="lg" c="dimmed" maw={600}>
            The all-in-one CRM platform designed to streamline your client relationships, 
            track sales, and boost your productivity with ease.
          </Text>
          <Group mt="lg">
            <Button size="lg" color="clientFlow.4"variant="strong" radius="xl">
              Get Started
            </Button>
            <Button size="lg" variant="subtle" color="clientFlow.4" radius="xl">
              Learn More
            </Button>
          </Group>
        </Stack>
        <Grid gutter="xl" mt={50}>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <FeatureCard 
              icon={<IconRocket size={24} />} 
              title="Fast Integration" 
              description="Connect your existing tools and be up and running in minutes."
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <FeatureCard 
              icon={<IconChartBar size={24} />} 
              title="Advanced Analytics" 
              description="Real-time data visualization to help you make informed decisions."
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <FeatureCard 
              icon={<IconShieldCheck size={24} />} 
              title="Secure Data" 
              description="Enterprise-grade security to keep your client information safe."
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <Paper p="xl" radius="md" withBorder shadow="sm">
      <ThemeIcon variant="light" size={48} radius="md" color="clientFlow.4">
        {icon}
      </ThemeIcon>
      <Text mt="md" fw={700} size="lg">
        {title}
      </Text>
      <Text size="sm" c="dimmed" mt="xs">
        {description}
      </Text>
    </Paper>
  );
};

export default Home;