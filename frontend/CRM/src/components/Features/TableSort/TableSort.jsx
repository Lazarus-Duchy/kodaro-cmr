import { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconEdit, IconSearch, IconSelector, IconTrash } from '@tabler/icons-react';
import { Button, Center, Flex, Group, keys, LoadingOverlay, Modal, NumberInput, ScrollArea, Stack, Table, Text, TextInput, UnstyledButton } from '@mantine/core';
import { DateInput, DatePickerInput, DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

const Th = ({ children, reversed, sorted, onSort })  => {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th>
      <UnstyledButton onClick={onSort}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function filterData(data, search) {
  const query = search.toLowerCase().trim();

  return data.filter((item) =>
    keys(data[0]).some((key) => item[key].toString().toLowerCase().includes(query))
  );
}

function sortData(data, payload) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].toString().localeCompare(a[sortBy]);
      }

      return a[sortBy].toString().localeCompare(b[sortBy]);
    }),
    payload.search
  );
}

export function TableSort({ 
  structure, 
  data, 
  addRowsTitle = "Add new row", 
  editRowTitle = "Edit row", 
  deleteRowTitle = "Delete row", 
  canAddRows = false, 
  canEditRows = false, 
  canDeleteRows = false 
}) {
  // Sort and Search
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);

  // Modals
  const [newRowLoading, { open: newRowLoadingStart, close: newRowLoadingEnd }] = useDisclosure(false);
  const [editRowLoading, { open: editRowLoadingStart, close: editRowLoadingEnd }] = useDisclosure(false);
  const [deleteRowLoading, { open: deleteRowLoadingStart, close: deleteRowLoadingEnd }] = useDisclosure(false);
  const [newRowOpened, { open: newRowOpen, close: newRowClose }] = useDisclosure(false);
  const [editRowOpened, { open: editRowOpen, close: editRowClose }] = useDisclosure(false);
  const [deleteRowOpened, { open: deleteRowOpen, close: deleteRowClose }] = useDisclosure(false);

  const newRowForm = useForm({
    mode: 'uncontrolled',

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const editRowForm = useForm({
    mode: 'uncontrolled',

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });
  // Handling Data Modifications
  const handleAddRow = async () => {
    newRowLoadingStart();
    const timer = setTimeout(() => {
      newRowLoadingEnd();
      newRowClose();
    }, 1000);
    
  }

  const handleEditRow = async () => {
    editRowLoadingStart();

    const timer = setTimeout(() => {
      editRowLoadingEnd();
      editRowClose();
    }, 1000);
  }

  const handleEditOpen = (row) => {
    setSelectedRow(row);
    editRowForm.setInitialValues(row);
    editRowForm.setValues(row);

    editRowOpen();
  }

  const handleDeleteRow = async () => {
    deleteRowLoadingStart();

    const timer = setTimeout(() => {
      deleteRowLoadingEnd();
      deleteRowClose();
    }, 1000);
  }

  // Handling Data Visualization
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

  const head = structure.map((column, index) => (
    <Th key={index} sorted={sortBy === column.name} reversed={reverseSortDirection} onSort={() => setSorting(column.name)}>{column.label}</Th>
  ));

  const rows = sortedData.map((row) => (
    <Table.Tr key={row.id}>
      {structure.map((column, index) => (
        <Table.Td key={index}>{row[column.name]}</Table.Td>
      ))}
      {(canEditRows || canDeleteRows) && 
        <Table.Td>
          <Group>
            {canEditRows && <Button variant='light' onClick={(event) => {handleEditOpen(row)}}><IconEdit size={20} stroke={1.5}/></Button>}
            {canDeleteRows && <Button variant='outline' color="red" onClick={(event) => {deleteRowOpen(row)}}><IconTrash color="red" size={20} stroke={1.5}/></Button>}
          </Group>
        </Table.Td>
      }

    </Table.Tr>
  ));

  useEffect(() => {
    let tempData = {}
    structure.forEach(column => {
      tempData[column.name] = column.default;
    });
    
    newRowForm.setValues(tempData);
    newRowForm.setInitialValues(tempData);
  }, [])

  return (
    <>
      <Modal opened={newRowOpened} onClose={newRowClose} title={addRowsTitle}>
        <LoadingOverlay visible={newRowLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <form onSubmit={newRowForm.onSubmit((values) => {handleAddRow()})}>
          <Stack>
            {
              structure.map((column) => {
              let inputElement;
              switch (column.type) {
                case "number": inputElement = (<NumberInput key={newRowForm.key(column.name)} label={column.label} readOnly={!column.isEditable} withAsterisk={column.required} required={column.required} {...newRowForm.getInputProps(column.name)} />); break;
                case "string": inputElement = (<TextInput key={newRowForm.key(column.name)} label={column.label} readOnly={!column.isEditable} withAsterisk={column.required} required={column.required} {...newRowForm.getInputProps(column.name)} />); break;
                case "date": inputElement = (<DateTimePicker key={newRowForm.key(column.name)} label={column.label} readOnly={!column.isEditable} withAsterisk={column.required} required={column.required} {...newRowForm.getInputProps(column.name)}/>); break;
              }

              return inputElement;
              })
            }
            <Group justify="flex-end">
              <Button variant="outline" color="red" onClick={() => {newRowClose()}}>Cancel</Button>
              <Button type='submit'>Add</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <Modal opened={editRowOpened} onClose={editRowClose} title={editRowTitle}>
        <LoadingOverlay visible={editRowLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <form onSubmit={editRowForm.onSubmit((values) => {handleEditRow()})}>
          <Stack>
            {
              structure.map((column) => {
              let inputElement;
              switch (column.type) {
                case "number": inputElement = (<NumberInput key={editRowForm.key(column.name)} label={column.label} readOnly={!column.isEditable} withAsterisk={column.required} required={column.required} {...editRowForm.getInputProps(column.name)} />); break;
                case "string": inputElement = (<TextInput key={editRowForm.key(column.name)} label={column.label} readOnly={!column.isEditable} withAsterisk={column.required} required={column.required} {...editRowForm.getInputProps(column.name)} />); break;
                case "date": inputElement = (<DateTimePicker key={editRowForm.key(column.name)} label={column.label} readOnly={!column.isEditable} withAsterisk={column.required} required={column.required} {...editRowForm.getInputProps(column.name)}/>); break;
              }

              return inputElement;
              })
            }
            <Group justify="flex-end">
              <Button variant="outline" color="red" onClick={() => {editRowClose()}}>Dismiss changes</Button>
              <Button type='submit'>Save changes</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <Modal opened={deleteRowOpened} onClose={deleteRowClose} title={deleteRowTitle}>
        <LoadingOverlay visible={deleteRowLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Stack>
          <Text size="sm">
            Are you sure you want to delete this row? This action is destructive, this data will be gone forever!
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => {deleteRowClose()}}>Cancel</Button>
            <Button color="red" onClick={handleDeleteRow}>Delete row</Button>
          </Group>
        </Stack>
        
      </Modal>

      <ScrollArea>
        <Flex direction="row" gap="xs">
          <TextInput
            placeholder="Search by any field"
            mb="md"
            w="90%"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
          />
          {canAddRows && <Button onClick={newRowOpen} w="10%">Add new row</Button>}
        </Flex>
      <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} layout="fixed" highlightOnHover stickyHeader stickyHeaderOffset={60}>
        <Table.Tbody>
          <Table.Tr>
            {head}
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={Object.keys(data[0]).length}>
                <Text fw={500} ta="center">
                  Nothing found
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
    </>
  );
}
