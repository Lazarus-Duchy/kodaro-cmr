import { Box, Checkbox, Flex, Grid, Paper, ScrollArea, Stack, Text, TextInput, Title, NumberInput, Loader, Center, Select } from "@mantine/core";
import { IconShoppingBag, IconCurrencyDollar, IconTool, IconTools, IconAxe, IconBolt } from "@tabler/icons-react";
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SummaryCard from "../../Features/SummaryCard/SummaryCard";
import { TableSort } from "../../Features/TableSort/TableSort";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { useListState } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import { get, post, patch, del } from "../../../api";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658"];
const RADIAN = Math.PI / 180;
const CURRENT_YEAR = new Date().getFullYear();

const CURRENCIES = ["USD", "EUR", "GBP", "PLN", "CHF", "JPY", "CAD", "AUD"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildChartData(purchases) {
  const productNames = [...new Set(purchases.map((p) => p.product_name ?? p.product ?? "Unknown"))];

  const monthMap = {};
  MONTH_NAMES.forEach((name, i) => {
    monthMap[i + 1] = { name };
    productNames.forEach((pName) => { monthMap[i + 1][pName] = 0; });
  });

  purchases.forEach((p) => {
    const d = new Date(p.date);
    if (d.getFullYear() !== CURRENT_YEAR) return;
    const month = d.getMonth() + 1;
    const productName = p.product_name ?? p.product ?? "Unknown";
    const value = parseFloat(p.unit_price ?? 0) * (p.quantity ?? 1);
    monthMap[month][productName] += value;
  });

  return Object.values(monthMap);
}

function buildProductRevenuePie(purchases) {
  const map = {};
  purchases.forEach((p) => {
    const name = p.product_name ?? p.product ?? "Unknown";
    const value = parseFloat(p.unit_price ?? 0) * (p.quantity ?? 1);
    map[name] = (map[name] ?? 0) + value;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
}

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

// ─── Table structure ──────────────────────────────────────────────────────────

const equipmentTableStructure = [
  { name: "name",         label: "Name"       },
  { name: "category",     label: "Category"   },
  { name: "quantity",     label: "Qty"        },
  { name: "unit_price",   label: "Unit Price" },
];

const purchaseValidation = {
  name: (v) => v ? null : "Name is required",
  category:  (v) => v ? null : "Category is required",
  quantity:   (v) => (v > 0 ? null : "Must be > 0"),
  unit_price: (v) => (v >= 0 ? null : "Must be ≥ 0"),
};

// ─── Component ────────────────────────────────────────────────────────────────

const Sales = () => {
  const [loading, setLoading] = useState(true);

  // Purchases table state
  const [equipment, setEquipment] = useState([]);
  const [equipmentCategories, setEquipmentCategories] = useState([]);

  // Chart state
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData]     = useState([]);
  const [productsDisplay, productsDisplayHandlers] = useListState([]);

  const [stats, setStats] = useState([
    { title: "Total Equipment", value: "—", icon: <IconAxe size={24} /> },
    { title: "Total Equipment Usage",     value: "—", icon: <IconBolt size={24} /> },
  ]);

  // ── Forms ──────────────────────────────────────────────────────────────────

  const newRowForm  = useForm({ mode: "uncontrolled", validate: purchaseValidation });
  const editRowForm = useForm({ mode: "uncontrolled", validate: purchaseValidation });

  const purchaseFields = (form) => [
    <TextInput 
      key={form.key("name")}
      label="Name"
      withAsterisk
      {...form.getInputProps("name")}
    />,
    <Select
      key={form.key("category")}
      label="Category"
      data={equipmentCategories}
      withAsterisk
      required
      searchable
      {...form.getInputProps("category")}
    />,
    <NumberInput
      key={form.key("quantity")}
      label="Quantity"
      min={1}
      withAsterisk
      required
      {...form.getInputProps("quantity")}
    />,
    <NumberInput
      key={form.key("unit_price")}
      label="Unit Price"
      min={0}
      decimalScale={2}
      withAsterisk
      required
      {...form.getInputProps("unit_price")}
    />,
  ];

  const newRowFields  = purchaseFields(newRowForm);
  const editRowFields = purchaseFields(editRowForm);

  // ── Fetch on mount ─────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [purchasesData, productsData, clientsData] = await Promise.all([
          get("/purchases/"),
          get("/products/"),
          get("/clients/"),
        ]);

        const purchaseList = Array.isArray(purchasesData) ? purchasesData : (purchasesData.results ?? []);
        const productList  = Array.isArray(productsData)  ? productsData  : (productsData.results  ?? []);
        const clientList   = Array.isArray(clientsData)   ? clientsData   : (clientsData.results   ?? []);

        // Dropdown options
        setProductOptions(productList.map((p) => ({ value: p.id, label: p.name })));
        setClientOptions(clientList.map((c)   => ({ value: c.id, label: c.name })));

        // Purchases table rows — flatten for display
        setEquipment(purchaseList.map((p) => ({
          id:           p.id,
          product_name: p.product_name ?? p.product ?? "—",
          client_name:  p.client_name  ?? p.client  ?? "—",
          quantity:     p.quantity,
          unit_price:   parseFloat(p.unit_price ?? 0),
          currency:     p.currency,
          date:         p.date,
          // keep raw IDs for edit form pre-fill
          product:      p.product,
          client:       p.client,
        })));

        // Charts
        setChartData(buildChartData(purchaseList));
        setPieData(buildProductRevenuePie(purchaseList));

        const uniqueNames = [...new Set(purchaseList.map((p) => p.product_name ?? p.product ?? "Unknown"))];
        productsDisplayHandlers.setState(uniqueNames.map((name) => ({ name, label: name, checked: true })));

        const totalRevenue = purchaseList.reduce(
          (sum, p) => sum + parseFloat(p.unit_price ?? 0) * (p.quantity ?? 1), 0
        );
        setStats([
          { title: "Total Equipment", value: String(totalRevenue), icon: <IconAxe size={24} /> },
          { title: "Total Equipment Usage",     value: String(purchaseList.length), icon: <IconBolt size={24} /> },
        ]);
      } catch (err) {
        console.error("Failed to load sales data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const handleAdd = async (values) => {
    // Format date as YYYY-MM-DD string if it's a Date object
    const payload = {
      ...values,
      date: values.date instanceof Date
        ? values.date.toISOString().split("T")[0]
        : values.date,
    };
    const created = await post("/purchases/", payload);
    setEquipment((prev) => [{
      id:           created.id,
      product_name: created.product_name ?? created.product ?? "—",
      client_name:  created.client_name  ?? created.client  ?? "—",
      quantity:     created.quantity,
      unit_price:   parseFloat(created.unit_price ?? 0),
      currency:     created.currency,
      date:         created.date,
      product:      created.product,
      client:       created.client,
    }, ...prev]);
  };

  const handleEdit = async (id, values) => {
    const payload = {
      ...values,
      date: values.date instanceof Date
        ? values.date.toISOString().split("T")[0]
        : values.date,
    };
    const updated = await patch(`/purchases/${id}/`, payload);
    setEquipment((prev) => prev.map((row) => row.id === id ? {
      id:           updated.id,
      product_name: updated.product_name ?? updated.product ?? "—",
      client_name:  updated.client_name  ?? updated.client  ?? "—",
      quantity:     updated.quantity,
      unit_price:   parseFloat(updated.unit_price ?? 0),
      currency:     updated.currency,
      date:         updated.date,
      product:      updated.product,
      client:       updated.client,
    } : row));
  };

  const handleDelete = async (id) => {
    await del(`/purchases/${id}/`);
    setEquipment((prev) => prev.filter((row) => row.id !== id));
  };

  // ── Checkbox state ─────────────────────────────────────────────────────────

  const allChecked    = productsDisplay.every((v) => v.checked);
  const indeterminate = productsDisplay.some((v) => v.checked) && !allChecked;

  if (loading) {
    return <Center h={400}><Loader size="lg" /></Center>;
  }

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Equipment Usage</Title>
        <Text c="dimmed" size="sm">Everything about usage of your equipment</Text>
      </Box>

      {/* ── Summary cards + Pie ── */}
      <Grid>
        {stats.map((stat, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 4 }}>
            <SummaryCard title={stat.title} icon={stat.icon} value={stat.value} desc={stat.desc} />
          </Grid.Col>
        ))}
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase" mb="xs">Usage per Equipment</Text>
            <ResponsiveContainer width="100%" aspect={1.4}>
              <PieChart>
                <Pie data={pieData} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, name) => [Number(v).toLocaleString(), name]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* ── Line chart ── */}
      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="xl">Usage per Equipment — {CURRENT_YEAR}</Text>
        <Flex wrap="wrap" gap="md">
          <Box h={300} style={{ flex: "1 1 70%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip
                  formatter={(v, name) => [Number(v).toLocaleString(), name]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                {productsDisplay.map((product, i) =>
                  product.checked ? (
                    <Line
                      key={product.name}
                      type="monotone"
                      dataKey={product.name}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ) : null
                )}
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <ScrollArea h={300} style={{ flex: "1 1 20%" }}>
            <Stack gap="xs">
              <Checkbox
                checked={allChecked}
                indeterminate={indeterminate}
                label="Show all"
                onChange={() =>
                  productsDisplayHandlers.setState((cur) => cur.map((v) => ({ ...v, checked: !allChecked })))
                }
              />
              {productsDisplay.map((product, i) => (
                <Checkbox
                  key={product.name}
                  ml={24}
                  label={product.label}
                  checked={product.checked}
                  onChange={(e) => productsDisplayHandlers.setItemProp(i, "checked", e.currentTarget.checked)}
                />
              ))}
            </Stack>
          </ScrollArea>
        </Flex>
      </Paper>

      {/* ── Purchases table ── */}
      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="md">Equipment</Text>
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
          canAddRows canEditRows canDeleteRows
          addRowsTitle="Add new equipment"
          editRowTitle="Edit equipment"
          deleteRowTitle="Delete equipment"
          addRowBtnInfo="Add equipment"
          deleteRowInfo="Are you sure you want to delete this equipment? This action cannot be undone."
        />
      </Paper>
    </Stack>
  );
};

export default Sales;