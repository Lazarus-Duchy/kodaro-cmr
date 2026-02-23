import {
  IconSpeakerphone,
  IconUsers,
  IconChartBar,
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch,
  IconFilter,
  IconAlertCircle,
  IconLoader2,
} from '@tabler/icons-react';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Title,
  Text,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Badge,
  Group,
  Button,
  Modal,
  MultiSelect,
  Divider,
  ActionIcon,
  Table,
  ScrollArea,
  Tooltip,
  Alert,
  Loader,
  Center,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import SummaryCard from '../../Features/SummaryCard/SummaryCard';

// ── Constants ─────────────────────────────────────────────────────────────────

const CAMPAIGN_TYPES    = ['Email', 'SMS', 'Social'];
const CAMPAIGN_STATUSES = ['Draft', 'Active', 'Paused', 'Completed'];

const STATUS_COLORS = {
  Draft:     'gray',
  Active:    'green',
  Paused:    'yellow',
  Completed: 'blue',
};

const CRITERIA_OPTIONS = [
  { value: 'age',               label: 'Age'              },
  { value: 'location',         label: 'Location'         },
  { value: 'purchase_history', label: 'Purchase History' },
  { value: 'behavior',         label: 'Behavior'         },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Rough union-size estimate: take the largest segment, then add 60 % of each
 * additional one to model partial overlap.
 */
const estimateAudience = (segmentIds, allSegments) => {
  if (!segmentIds?.length || !allSegments?.length) return 0;
  const sizes = segmentIds
    .map((id) => allSegments.find((s) => s._id === id)?.estimatedSize ?? 0)
    .filter(Boolean);
  if (!sizes.length) return 0;
  const [max, ...rest] = [...sizes].sort((a, b) => b - a);
  return Math.round(max + rest.reduce((acc, v) => acc + v * 0.6, 0));
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ── Shared form validation ─────────────────────────────────────────────────────

const formValidation = {
  name:       (v) => v.trim().length < 2          ? 'Name must be at least 2 characters'   : null,
  type:       (v) => !v                           ? 'Campaign type is required'             : null,
  start_date: (v) => !v                           ? 'Start date is required'                : null,
  end_date:   (v, vals) =>
    !v                                            ? 'End date is required'                  :
    vals.start_date && v < vals.start_date        ? 'End date must be after start date'     : null,
  goal:       (v) => v.trim().length < 3          ? 'Goal is required'                      : null,
};

const EMPTY_FORM = {
  name: '', type: '', start_date: null, end_date: null,
  budget: '', goal: '', description: '', segment_ids: [], status: 'Draft',
};

// ── Component ─────────────────────────────────────────────────────────────────

const Campaigns = () => {
  // ── Convex live queries ────────────────────────────────────────────────────
  const campaigns = useQuery(api.campaigns.list);            // undefined while loading
  const segments  = useQuery(api.segments.list, {});         // undefined while loading

  // ── Convex mutations ───────────────────────────────────────────────────────
  const createCampaign = useMutation(api.campaigns.create);
  const updateCampaign = useMutation(api.campaigns.update);
  const removeCampaign = useMutation(api.campaigns.remove);
  const seedSegments   = useMutation(api.segments.seed);

  // ── Seed segments on first load ────────────────────────────────────────────
  useEffect(() => {
    // Only seed once the segments query has resolved and is empty
    if (segments !== undefined && segments.length === 0) {
      seedSegments({});
    }
  }, [segments]);

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [addModalOpen, setAddModalOpen]   = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [deleteModal, setDeleteModal]     = useState({ open: false, id: null, name: '' });
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterType, setFilterType]       = useState(null);
  const [filterStatus, setFilterStatus]   = useState(null);
  const [criteriaFilter, setCriteriaFilter] = useState([]);
  const [submitting, setSubmitting]       = useState(false);

  // ── Derived summary stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!campaigns || !segments) return [
      { title: 'Total Campaigns',  value: '—', icon: <IconSpeakerphone size={24} /> },
      { title: 'Active Campaigns', value: '—', desc: 'Running now',         icon: <IconChartBar size={24} /> },
      { title: 'Total Audience',   value: '—', desc: 'Across all segments', icon: <IconUsers size={24} />    },
    ];
    const active        = campaigns.filter(c => c.status === 'Active').length;
    const allSegmentIds = [...new Set(campaigns.flatMap(c => c.segment_ids))];
    const totalAudience = estimateAudience(allSegmentIds, segments);
    return [
      { title: 'Total Campaigns',  value: String(campaigns.length),            icon: <IconSpeakerphone size={24} /> },
      { title: 'Active Campaigns', value: String(active), desc: 'Running now', icon: <IconChartBar size={24} /> },
      { title: 'Total Audience',   value: totalAudience.toLocaleString(), desc: 'Across all segments', icon: <IconUsers size={24} /> },
    ];
  }, [campaigns, segments]);

  // ── Filtered table rows ────────────────────────────────────────────────────
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return campaigns.filter(c => {
      const q = searchQuery.toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !c.goal.toLowerCase().includes(q)) return false;
      if (filterType   && c.type   !== filterType)   return false;
      if (filterStatus && c.status !== filterStatus) return false;
      return true;
    });
  }, [campaigns, searchQuery, filterType, filterStatus]);

  // ── Filtered segments ──────────────────────────────────────────────────────
  const filteredSegments = useMemo(() => {
    if (!segments) return [];
    return criteriaFilter.length
      ? segments.filter(s => criteriaFilter.includes(s.criteria))
      : segments;
  }, [segments, criteriaFilter]);

  // ── Segment MultiSelect options ────────────────────────────────────────────
  const segmentOptions = useMemo(() =>
    filteredSegments.map(s => ({ value: s._id, label: s.label })),
    [filteredSegments]
  );

  // ── Forms ──────────────────────────────────────────────────────────────────
  const newForm  = useForm({ mode: 'uncontrolled', initialValues: { ...EMPTY_FORM }, validate: formValidation });
  const editForm = useForm({ mode: 'uncontrolled', initialValues: { ...EMPTY_FORM }, validate: formValidation });

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleAdd = async (values) => {
    setSubmitting(true);
    try {
      await createCampaign({
        name:        values.name.trim(),
        type:        values.type,
        start_date:  values.start_date instanceof Date
                       ? values.start_date.toISOString().split('T')[0]
                       : values.start_date,
        end_date:    values.end_date instanceof Date
                       ? values.end_date.toISOString().split('T')[0]
                       : values.end_date,
        budget:      values.budget !== '' ? Number(values.budget) : undefined,
        goal:        values.goal.trim(),
        description: values.description?.trim() ?? '',
        status:      values.status,
        segment_ids: values.segment_ids ?? [],
      });
      newForm.reset();
      setAddModalOpen(false);
    } catch (e) {
      console.error('Failed to create campaign:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (campaign) => {
    setEditTarget(campaign);
    editForm.setValues({
      name:        campaign.name,
      type:        campaign.type,
      start_date:  campaign.start_date ? new Date(campaign.start_date) : null,
      end_date:    campaign.end_date   ? new Date(campaign.end_date)   : null,
      budget:      campaign.budget ?? '',
      goal:        campaign.goal,
      description: campaign.description ?? '',
      status:      campaign.status,
      segment_ids: campaign.segment_ids ?? [],
    });
    setEditModalOpen(true);
  };

  const handleEdit = async (values) => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await updateCampaign({
        id:          editTarget._id,
        name:        values.name.trim(),
        type:        values.type,
        start_date:  values.start_date instanceof Date
                       ? values.start_date.toISOString().split('T')[0]
                       : values.start_date,
        end_date:    values.end_date instanceof Date
                       ? values.end_date.toISOString().split('T')[0]
                       : values.end_date,
        budget:      values.budget !== '' ? Number(values.budget) : undefined,
        goal:        values.goal.trim(),
        description: values.description?.trim() ?? '',
        status:      values.status,
        segment_ids: values.segment_ids ?? [],
      });
      setEditModalOpen(false);
      setEditTarget(null);
    } catch (e) {
      console.error('Failed to update campaign:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await removeCampaign({ id: deleteModal.id });
      setDeleteModal({ open: false, id: null, name: '' });
    } catch (e) {
      console.error('Failed to delete campaign:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Form fields renderer (shared between add & edit modals) ───────────────

  const renderFormFields = (form) => {
    const values      = form.getValues();
    const selectedIds = values.segment_ids ?? [];
    const audienceEst = estimateAudience(selectedIds, segments ?? []);

    return (
      <Stack gap="sm">
        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Campaign Name" withAsterisk
              placeholder="e.g. Summer Sale Blast"
              {...form.getInputProps('name')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Type" withAsterisk
              data={CAMPAIGN_TYPES}
              placeholder="Select type"
              {...form.getInputProps('type')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <DatePickerInput
              label="Start Date" withAsterisk
              placeholder="Pick date"
              {...form.getInputProps('start_date')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <DatePickerInput
              label="End Date" withAsterisk
              placeholder="Pick date"
              {...form.getInputProps('end_date')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="Budget (USD)"
              placeholder="5000"
              min={0}
              prefix="$"
              {...form.getInputProps('budget')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Status"
              data={CAMPAIGN_STATUSES}
              {...form.getInputProps('status')}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Goal" withAsterisk
          placeholder="e.g. Drive 500 conversions"
          {...form.getInputProps('goal')}
        />

        <Textarea
          label="Description"
          placeholder="Optional notes about this campaign…"
          minRows={2}
          {...form.getInputProps('description')}
        />

        <Divider label="Audience Segmentation" labelPosition="left" />

        <MultiSelect
          label="Filter segments by criteria"
          data={CRITERIA_OPTIONS}
          value={criteriaFilter}
          onChange={setCriteriaFilter}
          placeholder="All criteria"
          clearable
        />

        <MultiSelect
          label="Assign Segments"
          data={segmentOptions}
          placeholder="Select segments to target"
          clearable
          searchable
          {...form.getInputProps('segment_ids')}
        />

        {selectedIds.length > 0 && (
          <Alert icon={<IconUsers size={16} />} color="blue" variant="light">
            <Text size="sm">
              Estimated audience:{' '}
              <Text component="span" fw={700}>{audienceEst.toLocaleString()} contacts</Text>
            </Text>
          </Alert>
        )}
      </Stack>
    );
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  const isLoading = campaigns === undefined || segments === undefined;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Stack gap="lg">

      {/* Page header */}
      <Box>
        <Title order={1}>Campaigns</Title>
        <Text c="dimmed" size="sm">Create and manage your marketing campaigns</Text>
      </Box>

      {/* Summary cards */}
      <Grid>
        {stats.map((stat, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 4 }}>
            <SummaryCard title={stat.title} icon={stat.icon} value={stat.value} desc={stat.desc} />
          </Grid.Col>
        ))}
      </Grid>

      {/* Segment overview */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="sm">
          <Text fw={700}>Audience Segments</Text>
          <MultiSelect
            size="xs"
            data={CRITERIA_OPTIONS}
            value={criteriaFilter}
            onChange={setCriteriaFilter}
            placeholder="Filter by criteria"
            clearable
            w={260}
            leftSection={<IconFilter size={14} />}
          />
        </Group>

        {isLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : (
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Segment</Table.Th>
                  <Table.Th>Criteria</Table.Th>
                  <Table.Th>Est. Size</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredSegments.map((s) => (
                  <Table.Tr key={s._id}>
                    <Table.Td>{s.label}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="violet" tt="capitalize">
                        {CRITERIA_OPTIONS.find(o => o.value === s.criteria)?.label ?? s.criteria}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{s.estimatedSize.toLocaleString()}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>

      {/* Campaign table */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md" wrap="wrap" gap="xs">
          <Text fw={700}>All Campaigns</Text>
          <Group gap="xs" wrap="wrap">
            <TextInput
              size="xs"
              placeholder="Search campaigns…"
              leftSection={<IconSearch size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              w={200}
            />
            <Select
              size="xs"
              data={CAMPAIGN_TYPES}
              value={filterType}
              onChange={setFilterType}
              placeholder="All types"
              clearable
              w={130}
            />
            <Select
              size="xs"
              data={CAMPAIGN_STATUSES}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="All statuses"
              clearable
              w={140}
            />
            <Button
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => { newForm.reset(); setAddModalOpen(true); }}
            >
              Add Campaign
            </Button>
          </Group>
        </Group>

        {isLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : (
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Campaign Name</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Start Date</Table.Th>
                  <Table.Th>End Date</Table.Th>
                  <Table.Th>Budget</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Est. Audience</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredCampaigns.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={8} ta="center" c="dimmed" py="xl">
                      No campaigns match your filters.
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredCampaigns.map((c) => (
                    <Table.Tr key={c._id}>
                      <Table.Td fw={500}>{c.name}</Table.Td>
                      <Table.Td>
                        <Badge
                          variant="outline"
                          color={c.type === 'Email' ? 'blue' : c.type === 'SMS' ? 'orange' : 'grape'}
                        >
                          {c.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(c.start_date)}</Table.Td>
                      <Table.Td>{formatDate(c.end_date)}</Table.Td>
                      <Table.Td>
                        {c.budget != null ? `$${Number(c.budget).toLocaleString()}` : '—'}
                      </Table.Td>
                      <Table.Td>
                        <Badge color={STATUS_COLORS[c.status] ?? 'gray'}>{c.status}</Badge>
                      </Table.Td>
                      <Table.Td>
                        {c.segment_ids?.length
                          ? estimateAudience(c.segment_ids, segments).toLocaleString()
                          : '—'}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4}>
                          <Tooltip label="Edit" withArrow>
                            <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(c)}>
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete" withArrow>
                            <ActionIcon
                              variant="subtle" color="red"
                              onClick={() => setDeleteModal({ open: true, id: c._id, name: c.name })}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>

      {/* ── Add Campaign Modal ── */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={<Text fw={700} size="lg">Add New Campaign</Text>}
        size="lg"
        centered
      >
        <form onSubmit={newForm.onSubmit(handleAdd)}>
          {renderFormFields(newForm)}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} leftSection={<IconPlus size={14} />}>
              Create Campaign
            </Button>
          </Group>
        </form>
      </Modal>

      {/* ── Edit Campaign Modal ── */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={<Text fw={700} size="lg">Edit Campaign</Text>}
        size="lg"
        centered
      >
        <form onSubmit={editForm.onSubmit(handleEdit)}>
          {renderFormFields(editForm)}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save Changes</Button>
          </Group>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        opened={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
        title={<Text fw={700} c="red" size="lg">Delete Campaign</Text>}
        size="sm"
        centered
      >
        <Stack>
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            Are you sure you want to delete <strong>{deleteModal.name}</strong>? This is permanent and cannot be undone.
          </Alert>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>
              Cancel
            </Button>
            <Button color="red" loading={submitting} leftSection={<IconTrash size={14} />} onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

    </Stack>
  );
};

export default Campaigns;