import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { Grid, Group, Paper, Text } from '@mantine/core';


const SummaryCard = ({ title, value, icon, diff, desc = "Compared to previous month" }) => {

  return (
    <Paper withBorder p="md" radius="md">
        <Group justify="space-between">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">{title}</Text>
        <Text c="clientFlow.4">{icon}</Text>
        </Group>
        <Group align="flex-end" gap="xs" mt={10}>
        <Text size="xl" fw={700}>{value}</Text>
        <Text c={diff > 0 ? 'teal' : 'red'} size="sm" fw={500} style={{ display: 'flex', alignItems: 'center' }}>
            {Math.abs(diff)}% {diff > 0 ? <IconArrowUpRight size={16} /> : <IconArrowDownRight size={16} />}
        </Text>
        </Group>
        <Text size="sm" c="dimmed" mt="xs">
            {desc}
        </Text>
    </Paper>
  )
}

export default SummaryCard