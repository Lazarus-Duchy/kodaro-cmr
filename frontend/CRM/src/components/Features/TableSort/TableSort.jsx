import { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconEdit, IconSearch, IconSelector, IconTrash } from '@tabler/icons-react';
import { Button, Center, Flex, Group, keys, LoadingOverlay, Modal, ScrollArea, Stack, Table, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const Th = ({ children, reversed, sorted, onSort }) => {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th>
      <UnstyledButton onClick={onSort}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">{children}</Text>
          <Center>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
};

function filterData(data, search) {
  const query = search.toLowerCase().trim();
  if (!data.length) return [];
  return data.filter((item) =>
    keys(item).some((key) => item[key]?.toString().toLowerCase().includes(query))
  );
}

function sortData(data, payload) {
  const { sortBy } = payload;
  if (!sortBy) return filterData(data, payload.search);
  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) return b[sortBy].toString().localeCompare(a[sortBy]);
      return a[sortBy].toString().localeCompare(b[sortBy]);
    }),
    payload.search
  );
}

export function TableSort({
  structure,
  data,
  onAdd,
  onEdit,
  onDelete,
  addRowsTitle = "Add new row",
  addRowBtnInfo = "Add new row",
  editRowTitle = "Edit row",
  deleteRowTitle = "Delete row",
  deleteRowInfo = "Are you sure you want to delete this row? This action is destructive, this data will be gone forever!",
  canAddRows = false,
  canEditRows = false,
  canDeleteRows = false,
  newRowForm,
  editRowForm,
  editRowFields,
  newRowFields,
}) {
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [error, setError] = useState(null);

  // Modals
  const [newRowLoading, { open: newRowLoadingStart, close: newRowLoadingEnd }] = useDisclosure(false);
  const [editRowLoading, { open: editRowLoadingStart, close: editRowLoadingEnd }] = useDisclosure(false);
  const [deleteRowLoading, { open: deleteRowLoadingStart, close: deleteRowLoadingEnd }] = useDisclosure(false);
  const [newRowOpened, { open: newRowOpen, close: newRowClose }] = useDisclosure(false);
  const [editRowOpened, { open: editRowOpen, close: editRowClose }] = useDisclosure(false);
  const [deleteRowOpened, { open: deleteRowOpen, close: deleteRowClose }] = useDisclosure(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddRow = async (values) => {
    newRowLoadingStart();
    setError(null);
    try {
      await onAdd?.(values);
      newRowClose();
      newRowForm.reset();
    } catch (err) {
      setError(err?.response?.data?.detail ?? "Failed to add row. Please try again.");
    } finally {
      newRowLoadingEnd();
    }
  };

  const handleEditRow = async (values) => {
    editRowLoadingStart();
    setError(null);
    try {
      await onEdit?.(selectedRow.id, values);
      editRowClose();
    } catch (err) {
      setError(err?.response?.data?.detail ?? "Failed to update row. Please try again.");
    } finally {
      editRowLoadingEnd();
    }
  };

  const handleEditOpen = (row) => {
    setSelectedRow(row);
    setError(null);
    editRowForm.setInitialValues(row);
    editRowForm.setValues(row);
    editRowOpen();
  };

  const handleDeleteRow = async () => {
    deleteRowLoadingStart();
    setError(null);
    try {
      await onDelete?.(selectedRow.id);
      deleteRowClose();
    } catch (err) {
      setError(err?.response?.data?.detail ?? "Failed to delete row. Please try again.");
    } finally {
      deleteRowLoadingEnd();
    }
  };

  const handleDeleteOpen = (row) => {
    setSelectedRow(row);
    setError(null);
    deleteRowOpen();
  };

  // ── Sorting & Search ─────────────────────────────────────────────────────────

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  useEffect(() => {
    let tempData = {};
    structure.forEach((column) => {
      tempData[column.name] = column.default;
    });
    newRowForm.setValues(tempData);
    newRowForm.setInitialValues(tempData);
  }, []);

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  const head = structure.map((column, index) => (
    <Th key={index} sorted={sortBy === column.name} reversed={reverseSortDirection} onSort={() => setSorting(column.name)}>
      {column.label}
    </Th>
  ));

  const rows = sortedData.map((row) => (
    <Table.Tr key={row.id}>
      {structure.map((column, index) => (
        <Table.Td key={index}>{row[column.name]}</Table.Td>
      ))}
      {(canEditRows || canDeleteRows) && (
        <Table.Td>
          <Group grow>
            {canEditRows && (
              <Button variant="light" onClick={() => handleEditOpen(row)}>
                <IconEdit size={20} stroke={1.5} />
              </Button>
            )}
            {canDeleteRows && (
              <Button variant="outline" color="red" onClick={() => handleDeleteOpen(row)}>
                <IconTrash size={20} stroke={1.5} />
              </Button>
            )}
          </Group>
        </Table.Td>
      )}
    </Table.Tr>
  ));

  return (
    <>
      {/* ── Add Modal ── */}
      <Modal opened={newRowOpened} onClose={newRowClose} title={addRowsTitle}>
        <LoadingOverlay visible={newRowLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <form onSubmit={newRowForm.onSubmit(handleAddRow)}>
          <Stack>
            {newRowFields}
            {error && <Text c="red" size="sm">{error}</Text>}
            <Group justify="flex-end">
              <Button variant="outline" color="red" onClick={newRowClose}>Cancel</Button>
              <Button type="submit">Add</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal opened={editRowOpened} onClose={editRowClose} title={editRowTitle}>
        <LoadingOverlay visible={editRowLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <form onSubmit={editRowForm.onSubmit(handleEditRow)}>
          <Stack>
            {editRowFields}
            {error && <Text c="red" size="sm">{error}</Text>}
            <Group justify="flex-end">
              <Button variant="outline" color="red" onClick={editRowClose}>Dismiss changes</Button>
              <Button type="submit">Save changes</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal opened={deleteRowOpened} onClose={deleteRowClose} title={deleteRowTitle}>
        <LoadingOverlay visible={deleteRowLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Stack>
          <Text size="sm">{deleteRowInfo}</Text>
          {error && <Text c="red" size="sm">{error}</Text>}
          <Group justify="flex-end">
            <Button variant="default" onClick={deleteRowClose}>Cancel</Button>
            <Button color="red" onClick={handleDeleteRow}>Delete row</Button>
          </Group>
        </Stack>
      </Modal>

      {/* ── Table ── */}
      <ScrollArea>
        <Flex direction="row" gap="xs">
          <TextInput
            placeholder="Search by any field"
            mb="md"
            w={canAddRows ? "85%" : "100%"}
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
          />
          {canAddRows && <Button onClick={newRowOpen} w="15%">{addRowBtnInfo}</Button>}
        </Flex>
        <Table verticalSpacing="sm" horizontalSpacing="md" miw={700} layout="fixed" highlightOnHover stickyHeader stickyHeaderOffset={60}>
          <Table.Tbody>
            <Table.Tr>{head}</Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={structure.length}>
                  <Text fw={500} ta="center">Nothing found</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </>
  );
}