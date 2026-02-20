import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { Group, Paper, Text } from '@mantine/core';


const SummaryCard = ({ title, value, icon, diffrence, desc }) => {
    const DiffIcon = diffrence > 0 ? IconArrowUpRight : IconArrowDownRight;

  return (
    <Paper withBorder p="md" radius="md" key={title}>
        <Group justify="space-between">
            <Text size="xs" c="dimmed">{title}</Text>
            {icon}
        </Group>

        <Group align="flex-end" gap="xs" mt={25}>
            <Text>{value}</Text>
            <Text c={diffrence > 0 ? 'teal' : 'red'} fz="sm" fw={500}>
            <span>{diffrence}%</span>
            <DiffIcon size={16} stroke={1.5} />
            </Text>
        </Group>

        <Text fz="xs" c="dimmed" mt={7}>
            {desc}
        </Text>
    </Paper>
  )
}

export default SummaryCard