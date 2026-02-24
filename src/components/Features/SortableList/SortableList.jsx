import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Flex, Paper, ScrollArea, Stack } from '@mantine/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IconGripVertical } from '@tabler/icons-react';
import { useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { directionBiased } from '@dnd-kit/collision';

const ItemDisplay = ({ ref = null, style = {}, attributes = null, listeners = null, customStyleProps = null, content, dragIcon = true }) => {
    return (
        <Paper withBorder p="md" radius="md"
        ref={ref} 
        style={style} 
        className='touch-action-none'
        {...attributes} 
        {...listeners} 
        {...customStyleProps}>
            <Flex gap="md" align="center">
                {dragIcon && <IconGripVertical size={18} stroke={1.5} />}
                {content}
            </Flex>
        </Paper>
    )
}
const SortableItem = ({ id, content, dragStyleProps, dragIcon }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, collisionDetection: directionBiased });

    // ── Style Settings ─────────────────────────────────────────────────────
    const draggingStyle = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <ItemDisplay 
        ref={setNodeRef} 
        style={draggingStyle} 
        attributes={attributes} 
        listeners={listeners} 
        content={content}
        customStyleProps={isDragging ? dragStyleProps : {} }
        dragIcon={dragIcon}
        />
    )
}
const SortableList = ({ defaultItems, onItemsChanged = null, header = null, footer = null, dragIcon = true, scrollAreaProps, overlay = false, dragStyleProps = {opacity: 0.2}, overlayStyleProps = {bg:"clientFlow.0", c:"clientFlow.4"} }) => {
    const [items, setItems] = useState(defaultItems);
    const [activeItem, setActiveItem] = useState(null);

    // ── Sensors Settings ────────────────────────────────────────────────────────
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 7,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // ── Handlers ────────────────────────────────────────────────────────────────
    const handleDragStart = (event) => {
        setActiveItem(items.find((item) => item.id === event.active.id));
    }

    const handleDragEnd = (event) => {
        setActiveItem(null);
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                
                const newItems = arrayMove(items, oldIndex, newIndex);

                if (onItemsChanged !== null) onItemsChanged(newItems);
                return newItems;
            })
        }
    }

    const handleDragCancel = (event) => {
        setActiveItem(null);
    }

    return (
        <ScrollArea {...scrollAreaProps} >
            <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}>
                <Stack gap="sm">
                    {/* ── Header ── */}
                    {header}
                    {/* ── Items ── */}
                    <SortableContext
                    items={items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}>
                        {items.map((item) => (
                            <SortableItem key={item.id} id={item.id} content={item.content} dragStyleProps={dragStyleProps} dragIcon={dragIcon} />
                        ))}
                    </SortableContext>
                    {/* ── Footer ── */}
                    {footer}
                </Stack>
                {/* ── Overlay ── */}
                <DragOverlay 
                adjustScale
                dropAnimation={{
                    duration: 150,
                    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }}>
                    {overlay && activeItem ? <ItemDisplay customStyleProps={overlayStyleProps} content={activeItem.content} dragIcon={dragIcon} /> : null}
                </DragOverlay>
            </DndContext>
        </ScrollArea>
    )
}

export default SortableList