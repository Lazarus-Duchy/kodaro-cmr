import {
  Box, Checkbox, Flex, Grid, Paper, ScrollArea,
  Stack, Text, TextInput, Title, NumberInput,
  Loader, Center, Select, Textarea,
} from "@mantine/core";
import {
  IconAxe, IconBolt, IconTool,
} from "@tabler/icons-react";
import {
  CartesianGrid, Cell, Legend, Bar, BarChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import SummaryCard from "../../Features/SummaryCard/SummaryCard";
import { TableSort } from "../../Features/TableSort/TableSort";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { get, post, patch, del } from "../../../api";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#ffc658", "#d0ed57"];
const RADIAN = Math.PI / 180;

// Mirrors Product.Status TextChoices
const STATUS_OPTIONS = [
  { value: "available",      label: "Available" },
  { value: "unavailable",    label: "Unavailable (Under Maintenance)" },
  { value: "decommissioned", label: "Decommissioned" },
];

// Mirrors Product.Currency TextChoices
const CURRENCY_OPTIONS = [
  { value: "PLN", label: "PLN" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Table structure — matches ProductListSerializer fields ───────────────────

const equipmentTableStructure = [
  { name: "name",          label: "Name",          default: "" },
  { name: "sku",           label: "SKU / Serial",  default: "" },
  { name: "category_name", label: "Category",      default: "" },
  { name: "status",        label: "Status",        default: "" },
  { name: "price",         label: "Price",         default: "" },
  { name: "currency",      label: "Currency",      default: "" },
];

// ─── Validation ───────────────────────────────────────────────────────────────

const equipmentValidation = {
  name:  (v) => (v ? null : "Name is required"),
  price: (v) => (v === "" || v === undefined || v === null ? "Price is required" : v < 0 ? "Must be ≥ 0" : null),
};

// ─── Default form values ──────────────────────────────────────────────────────

const initialValues = {
  name:        "",
  sku:         "",
  description: "",
  status:      "available",
  category:    null,
  price:       "",
  currency:    "PLN",
  tax_rate:    0,
};

// ─── Component ────────────────────────────────────────────────────────────────

const Sales = () => {
  const [loading, setLoading] = useState(true);

  // Table data
  const [equipment, setEquipment] = useState([]);

  // Select options for the category dropdown
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Chart data derived from /equipment/stats/
  const [categoryPieData, setCategoryPieData] = useState([]);
  const [statusBarData,   setStatusBarData]   = useState([]);

  // Summary card values
  const [stats, setStats] = useState([
    { title: "Total Equipment",  value: "—", icon: <IconAxe  size={24} /> },
    { title: "Available",        value: "—", icon: <IconBolt size={24} /> },
    { title: "Under Maintenance",value: "—", icon: <IconTool size={24} /> },
  ]);

  // ── Forms ──────────────────────────────────────────────────────────────────

  const newRowForm  = useForm({ mode: "uncontrolled", initialValues, validate: equipmentValidation });
  const editRowForm = useForm({ mode: "uncontrolled", initialValues, validate: equipmentValidation });

  // categoryOptions is passed explicitly so the Select always has the latest
  // data regardless of when the async fetch resolves.
  // useMemo is intentionally NOT used here: newRowForm is a stable reference
  // so the memo would only re-run on categoryOptions changes — but because
  // buildFields isn't in the dep array the closure would still be stale on
  // the first render (before the fetch), leaving the Select with data={[]}.
  // Mantine uncontrolled mode stores state in the form object, so rebuilding
  // the JSX on every render is safe.
  const buildFields = (form, catOptions) => [
    <TextInput
      key={form.key("name")}
      label="Name"
      withAsterisk
      {...form.getInputProps("name")}
    />,
    <TextInput
      key={form.key("sku")}
      label="SKU / Serial Number"
      {...form.getInputProps("sku")}
    />,
    <Textarea
      key={form.key("description")}
      label="Description"
      autosize
      minRows={2}
      {...form.getInputProps("description")}
    />,
    <Select
      key={form.key("status")}
      label="Status"
      data={STATUS_OPTIONS}
      {...form.getInputProps("status")}
    />,
    <Select
      key={form.key("category")}
      label="Category"
      data={catOptions}
      searchable
      clearable
      {...form.getInputProps("category")}
    />,
    <NumberInput
      key={form.key("price")}
      label="Price"
      withAsterisk
      min={0}
      decimalScale={2}
      {...form.getInputProps("price")}
    />,
    <Select
      key={form.key("currency")}
      label="Currency"
      data={CURRENCY_OPTIONS}
      {...form.getInputProps("currency")}
    />,
    <NumberInput
      key={form.key("tax_rate")}
      label="Tax Rate (%)"
      min={0}
      max={100}
      decimalScale={2}
      suffix="%"
      {...form.getInputProps("tax_rate")}
    />,
  ];

  const newRowFields  = buildFields(newRowForm,  categoryOptions);
  const editRowFields = buildFields(editRowForm, categoryOptions);

  // ── Stats helper ────────────────────────────────────────────────────────────

  const applyStats = (statsData, equipmentList) => {
    const byStatus = statsData?.by_status ?? {};
    const total    = equipmentList.length;

    setStats([
      { title: "Total Equipment",   value: String(total),                          icon: <IconAxe  size={24} /> },
      { title: "Available",         value: String(byStatus["available"]      ?? 0), icon: <IconBolt size={24} /> },
      { title: "Under Maintenance", value: String(byStatus["unavailable"]    ?? 0), icon: <IconTool size={24} /> },
    ]);

    // Pie — equipment count per category
    const byCategory = statsData?.by_category ?? [];
    setCategoryPieData(
      byCategory.map((item) => ({
        name:  item.category__name ?? "Uncategorised",
        value: item.count,
      }))
    );

    // Bar — equipment count per status
    setStatusBarData(
      Object.entries(byStatus).map(([status, count]) => ({
        name:  STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status,
        count,
      }))
    );
  };

  // ── Fetch on mount ──────────────────────────────────────────────────────────

  const refreshStats = async (currentList) => {
    const statsData = await get("/equipment/stats/");
    applyStats(statsData, currentList);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [equipmentData, categoriesData, statsData] = await Promise.all([
          get("/equipment/"),
          get("/equipment/categories/"),
          get("/equipment/stats/"),
        ]);

        const list = Array.isArray(equipmentData) ? equipmentData : (equipmentData.results ?? []);
        setEquipment(list);

        const cats = Array.isArray(categoriesData) ? categoriesData : (categoriesData.results ?? []);
        setCategoryOptions(cats.map((c) => ({ value: c.id, label: c.name })));

        applyStats(statsData, list);
      } catch (err) {
        console.error("Failed to load equipment data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const serializeValues = (values) => ({
    ...values,
    // NumberInput returns "" when empty — backend DecimalField rejects that
    price:    values.price    === "" ? null : values.price,
    tax_rate: values.tax_rate === "" ? 0    : values.tax_rate,
    // null category is fine (SET_NULL on the model)
    category: values.category ?? null,
  });

  const handleAdd = async (values) => {
    const created = await post("/equipment/", serializeValues(values));
    setEquipment((prev) => {
      const next = [created, ...prev];
      refreshStats(next);
      return next;
    });
  };

  const handleEdit = async (id, values) => {
    const updated = await patch(`/equipment/${id}/`, serializeValues(values));
    setEquipment((prev) => {
      const next = prev.map((row) => (row.id === id ? updated : row));
      refreshStats(next);
      return next;
    });
  };

  const handleDelete = async (id) => {
    await del(`/equipment/${id}/`);
    setEquipment((prev) => {
      const next = prev.filter((row) => row.id !== id);
      refreshStats(next);
      return next;
    });
  };

  // ── Loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return <Center h={400}><Loader size="lg" /></Center>;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Equipment Management</Title>
        <Text c="dimmed" size="sm">Track and manage all rescue team equipment</Text>
      </Box>

      {/* ── Summary cards + Category pie ── */}
      <Grid>
        {stats.map((stat, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 3 }}>
            <SummaryCard title={stat.title} icon={stat.icon} value={stat.value} desc={stat.desc} />
          </Grid.Col>
        ))}

        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase" mb="xs">By Category</Text>
            <ResponsiveContainer width="100%" aspect={1.2}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {categoryPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, name) => [v, name]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* ── Status bar chart ── */}
      {statusBarData.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Text fw={700} mb="xl">Equipment by Operational Status</Text>
          <Box h={250}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBarData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                <Tooltip
                  formatter={(v) => [v, "Items"]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusBarData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {/* ── Equipment table ── */}
      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="md">All Equipment</Text>
        <TableSort
          structure={equipmentTableStructure}
          data={equipment}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          newRowForm={newRowForm}
          editRowForm={editRowForm}
          newRowFields={newRowFields}
          editRowFields={editRowFields}
          canAddRows
          canEditRows
          canDeleteRows
          addRowsTitle="Add new equipment"
          editRowTitle="Edit equipment"
          deleteRowTitle="Delete equipment"
          addRowBtnInfo="Add equipment"
          deleteRowInfo="Are you sure you want to delete this equipment item? This action cannot be undone."
        />
      </Paper>
    </Stack>
  );
};

export default Sales;