import { useEffect, useState } from 'react';
import {
  Grid, Paper, Text, Title, Stack, Box, Loader, Center, Badge, Group,
  Button, Modal, Select, NumberInput, Textarea, LoadingOverlay, Flex,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconActivity,
  IconUserHeart,
  IconAlertTriangle,
  IconPlus,
} from '@tabler/icons-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import SummaryCard from '../../Features/SummaryCard/SummaryCard';
import { get, post } from '../../../api';

// ── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const OUTCOME_COLORS = {
  successful:   '#4caf50',
  hospitalized: '#ff9800',
  unsuccessful: '#f44336',
  false_alarm:  '#9e9e9e',
  ongoing:      '#2196f3',
};

const OUTCOME_LABELS = {
  successful:   'Successful',
  hospitalized: 'Hospitalized',
  unsuccessful: 'Unsuccessful',
  false_alarm:  'False Alarm',
  ongoing:      'Ongoing',
};

// Mirrors Rescue.Outcome TextChoices
const OUTCOME_OPTIONS = Object.entries(OUTCOME_LABELS).map(([value, label]) => ({ value, label }));

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupByMonth(rescues) {
  const currentYear = new Date().getFullYear();
  const map = {};
  MONTH_NAMES.forEach((name, i) => {
    map[i + 1] = { name, operations: 0, equipment_deployed: 0 };
  });
  rescues.forEach((rescue) => {
    const d = new Date(rescue.date);
    if (d.getFullYear() !== currentYear) return;
    const month = d.getMonth() + 1;
    map[month].operations         += 1;
    map[month].equipment_deployed += rescue.equipment_quantity ?? 1;
  });
  return Object.values(map);
}

// DRF error extractor — same pattern as TableSort
const extractError = (err) => {
  const data = err?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const msgs = [];
  for (const [key, value] of Object.entries(data)) {
    const parts = Array.isArray(value) ? value : [String(value)];
    msgs.push(key === 'non_field_errors' ? parts.join(', ') : `${key}: ${parts.join(', ')}`);
  }
  return msgs.join(' | ') || 'Something went wrong.';
};

// ── Component ────────────────────────────────────────────────────────────────

const Reports = () => {
  const [chartData, setChartData]     = useState([]);
  const [outcomeData, setOutcomeData] = useState([]);
  const [statsRaw, setStatsRaw]       = useState(null);
  const [loading, setLoading]         = useState(true);

  // Select options pre-fetched for the form
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [survivorOptions, setSurvivorOptions]   = useState([]);

  // Modal
  const [opened, { open, close }]                             = useDisclosure(false);
  const [submitting, { open: startSubmit, close: endSubmit }] = useDisclosure(false);
  const [formError, setFormError]                             = useState(null);

  const form = useForm({
    initialValues: {
      date:               new Date(),
      equipment:          null,
      survivor:           null,
      outcome:            'ongoing',
      equipment_quantity: 1,
      notes:              '',
    },
    validate: {
      date:               (v) => (!v ? 'Date is required' : null),
      equipment:          (v) => (!v ? 'Equipment is required' : null),
      survivor:           (v) => (!v ? 'Survivor is required' : null),
      outcome:            (v) => (!v ? 'Outcome is required' : null),
      equipment_quantity: (v) => (!v || v < 1 ? 'Must be at least 1' : null),
    },
  });

  // ── Data helpers ─────────────────────────────────────────────────────────

  const applyChartState = (list, stats) => {
    setChartData(groupByMonth(list));
    setStatsRaw(stats);
    setOutcomeData(
      (stats.by_outcome ?? []).map((item) => ({
        name:  OUTCOME_LABELS[item.outcome] ?? item.outcome,
        count: item.count,
        color: OUTCOME_COLORS[item.outcome] ?? '#888',
      }))
    );
  };

  const refreshCharts = async () => {
    const [rescues, stats] = await Promise.all([
      get('/rescues/'),
      get('/rescues/stats/'),
    ]);
    const list = Array.isArray(rescues) ? rescues : (rescues.results ?? []);
    applyChartState(list, stats);
  };

  // ── Mount ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rescues, stats, equipment, survivors] = await Promise.all([
          get('/rescues/'),
          get('/rescues/stats/'),
          get('/equipment/'),
          get('/survivors/'),
        ]);

        const list      = Array.isArray(rescues)    ? rescues    : (rescues.results    ?? []);
        const equipList = Array.isArray(equipment)   ? equipment  : (equipment.results  ?? []);
        const survList  = Array.isArray(survivors)   ? survivors  : (survivors.results  ?? []);

        applyChartState(list, stats);

        setEquipmentOptions(equipList.map((e) => ({
          value: e.id,
          label: e.sku ? `${e.name} (${e.sku})` : e.name,
        })));
        setSurvivorOptions(survList.map((s) => ({
          value: s.id,
          label: s.name,
        })));
      } catch (error) {
        console.error('Failed to fetch rescue data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Form submit ──────────────────────────────────────────────────────────

  const handleSubmit = async (values) => {
    startSubmit();
    setFormError(null);
    try {
      const payload = {
        ...values,
        // DateInput returns a Date object; backend expects "YYYY-MM-DD"
        date: values.date instanceof Date
          ? values.date.toISOString().slice(0, 10)
          : values.date,
      };
      await post('/rescues/', payload);
      await refreshCharts();
      form.reset();
      // Re-apply defaults that reset() clears
      form.setValues({ date: new Date(), outcome: 'ongoing', equipment_quantity: 1 });
      close();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      endSubmit();
    }
  };

  // ── Summary cards ────────────────────────────────────────────────────────

  const totalOps   = statsRaw?.totals?.total_operations        ?? '—';
  const totalEquip = statsRaw?.totals?.total_equipment_deployed ?? '—';
  const ongoingOps = (statsRaw?.by_outcome ?? []).find((o) => o.outcome === 'ongoing')?.count ?? 0;

  const summaryStats = [
    {
      title: 'Total Operations',
      value: String(totalOps),
      desc:  `This year: ${chartData.reduce((s, m) => s + m.operations, 0)}`,
      icon:  <IconActivity size={24} />,
    },
    {
      title: 'Equipment Deployed',
      value: String(totalEquip),
      desc:  'Total units across all rescues',
      icon:  <IconUserHeart size={24} />,
    },
    {
      title: 'Ongoing Operations',
      value: String(ongoingOps),
      desc:  'Currently active',
      icon:  <IconAlertTriangle size={24} />,
    },
  ];

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">

      {/* ── Log Operation Modal ── */}
      <Modal opened={opened} onClose={close} title="Log Rescue Operation" size="md">
        <LoadingOverlay visible={submitting} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <DateInput
              label="Date"
              withAsterisk
              valueFormat="YYYY-MM-DD"
              {...form.getInputProps('date')}
            />
            <Select
              label="Equipment"
              withAsterisk
              placeholder="Search equipment…"
              data={equipmentOptions}
              searchable
              {...form.getInputProps('equipment')}
            />
            <Select
              label="Survivor"
              withAsterisk
              placeholder="Search survivors…"
              data={survivorOptions}
              searchable
              {...form.getInputProps('survivor')}
            />
            <Select
              label="Outcome"
              withAsterisk
              data={OUTCOME_OPTIONS}
              {...form.getInputProps('outcome')}
            />
            <NumberInput
              label="Equipment Units Deployed"
              withAsterisk
              min={1}
              {...form.getInputProps('equipment_quantity')}
            />
            <Textarea
              label="Notes"
              placeholder="Operational notes or after-action remarks"
              autosize
              minRows={2}
              {...form.getInputProps('notes')}
            />

            {formError && <Text c="red" size="sm">{formError}</Text>}

            <Group justify="flex-end" mt="xs">
              <Button variant="outline" color="red" onClick={close}>Cancel</Button>
              <Button type="submit" leftSection={<IconPlus size={16} />}>
                Log Operation
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* ── Page header ── */}
      <Flex justify="space-between" align="center">
        <Box>
          <Title order={1}>Analytics Reports</Title>
          <Text c="dimmed" size="sm">
            Monthly rescue operations overview for {new Date().getFullYear()}
          </Text>
        </Box>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Log Operation
        </Button>
      </Flex>

      {/* ── Summary cards ── */}
      <Grid>
        {summaryStats.map((stat, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 4 }}>
            <SummaryCard
              title={stat.title}
              icon={stat.icon}
              value={stat.value}
              desc={stat.desc}
            />
          </Grid.Col>
        ))}
      </Grid>

      {/* ── Monthly operations area chart ── */}
      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="xl">
          Monthly Operations — {new Date().getFullYear()}
        </Text>
        <Box h={350}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#88c9c5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#88c9c5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip
                formatter={(value) => [value, 'Operations']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="operations"
                stroke="#88c9c5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorOps)"
                dot={{ r: 4, fill: '#88c9c5', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* ── Outcome breakdown bar chart ── */}
      {outcomeData.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Text fw={700} mb="xl">Operations by Outcome</Text>
          <Box h={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip
                  formatter={(value) => [value, 'Operations']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#88c9c5" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Group mt="md" gap="xs" wrap="wrap">
            {outcomeData.map((o) => (
              <Badge
                key={o.name}
                variant="light"
                style={{ backgroundColor: `${o.color}22`, color: o.color, borderColor: o.color }}
              >
                {o.name}: {o.count}
              </Badge>
            ))}
          </Group>
        </Paper>
      )}

      {/* ── Monthly breakdown table ── */}
      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="md">Monthly Breakdown — {new Date().getFullYear()}</Text>
        <Grid>
          {chartData.map((month) => (
            <Grid.Col key={month.name} span={{ base: 6, sm: 4, md: 2 }}>
              <Paper withBorder p="sm" radius="md" ta="center">
                <Text size="xs" c="dimmed" fw={600}>{month.name}</Text>
                <Text fw={700} size="lg" mt={4}>{month.operations}</Text>
                <Text size="xs" c="dimmed">
                  {month.operations === 1 ? 'operation' : 'operations'}
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {month.equipment_deployed} units
                </Text>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Paper>

    </Stack>
  );
};

export default Reports;