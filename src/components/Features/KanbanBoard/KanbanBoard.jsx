import { useDroppable, closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Flex, Grid, Paper, ScrollArea, Stack, Title } from '@mantine/core'
import { IconGripVertical } from '@tabler/icons-react';
import { useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { directionBiased } from '@dnd-kit/collision';

const ItemDisplay = ({ ref = null, style = {}, attributes = null, listeners = null, customStyleProps = null, content, dragIcon=true }) => {
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

const DroppableContainer = ({ id, title, items, header, footer, gridColProps, scrollAreaProps, dragStyleProps, dragIcon }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <Grid.Col key={id} ref={setNodeRef} {...gridColProps}>
            <Paper withBorder p="md" radius="md">
                <Title>{title}</Title>
                <ScrollArea {...scrollAreaProps}>
                    <Stack>
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
                </ScrollArea>
            </Paper>
        </Grid.Col>
    );
}
const KanbanBoard = ({ defaultContainers, onContainersChanged = null, header = null, footer = null, dragIcon = true, scrollAreaProps = {}, gridColProps = {span:{base:12,sm: 4}}, dragStyleProps = {opacity: 0.2}, overlay = false, overlayStyleProps = {bg:"clientFlow.0", c:"clientFlow.4"} }) => {
    const [containers, setContainers] = useState(defaultContainers);
    const [activeItem, setActiveItem] = useState(null);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const findContainerId = (itemId) => {
        if (containers.some((container) => container.id === itemId)) return itemId;

        return containers.find((container) => container.items.some((item) => item.id === itemId))?.id;
    }
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
        const container = containers.find((container) => container.items.some((item) => item.id === event.active.id));
        setActiveItem(container.items.find((item) => item.id === event.active.id));
    }

    const handleDragOver = (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainerId = findContainerId(activeId);
        const overContainerId = findContainerId(overId);

        if (!activeContainerId || !overContainerId) return;

        if (activeContainerId === overContainerId && activeId !== overId) return;

        if (activeContainerId === overContainerId) return;

        setContainers((prev) => {
            const activeContainer = prev.find((container) => container.id === activeContainerId);
            if (!activeContainer) return prev;

            const curActiveItem = activeContainer.items.find((item) => item.id === activeId);
            if (!curActiveItem) return prev;

            const newContainers = prev.map((container) => {
                // Remove item from source container
                if (container.id === activeContainerId) {
                    return {
                        ...container,
                        items: container.items.filter((item) => item.id !== activeId),
                    }
                }

                if (container.id === overContainerId) {
                    // Add item to target container 
                    if (overId === overContainerId) {
                        return {
                            ...container,
                            items: [...container.items, curActiveItem],
                        }
                    }
                    
                    // Dragging item over another item
                    const overItemIndex = container.items.findIndex((item) => item.id === overId);
                    if (overItemIndex !== -1) {
                        return {
                            ...container,
                            items: [
                                ...container.items.slice(0, overItemIndex + 1),
                                curActiveItem,
                                ...container.items.slice(overItemIndex + 1),
                            ],
                        }
                    }
                }
                return container;

            })

            if (onContainersChanged !== null) onContainersChanged(newContainers);
            return newContainers;
        })
        
    }

    const handleDragEnd = (event) => {  
        const { active, over } = event;

        if (!over) {setActiveItem(null); return;}

        const activeId = active.id;
        const overId = over.id;

        const activeContainerId = findContainerId(activeId);
        const overContainerId = findContainerId(overId);

        if (!activeContainerId || !overContainerId) {setActiveItem(null); return;}

        if (activeContainerId === overContainerId && activeId !== overId) {
            const containerIndex = containers.findIndex((container) => container.id === activeContainerId);

            if (containerIndex === -1) {setActiveItem(null); return;}
            const container = containers[containerIndex];

            const activeIndex = container.items.findIndex((item) => item.id === activeId);
            const overIndex = container.items.findIndex((item) => item.id === overId);

            if (activeIndex !== -1 && overIndex !== -1) {
                const newItems = arrayMove(container.items, activeIndex, overIndex);

                const newContainers = containers.map((container, index) => {
                    if (index === containerIndex) return {...container, items: newItems};
                    return container;
                });

                if (onContainersChanged !== null) onContainersChanged(newContainers);

                setContainers(newContainers);
            }
        }

        setActiveItem(null);
    }

    const handleDragCancel = (event) => {
        setActiveItem(null);
    }

    return (
        <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}>
            <Grid>
                {/* ── Containers ── */}
                {containers.map((container) => (
                    <DroppableContainer
                    key={container.id}
                    id={container.id}
                    title={container.title}
                    items={container.items}
                    header={header}
                    footer={footer}
                    scrollAreaProps={scrollAreaProps}
                    gridColProps={gridColProps}
                    dragStyleProps={dragStyleProps}
                    dragIcon={dragIcon}/>
                ))}
            </Grid>
            {/* ── Overlay ── */}
            <DragOverlay 
            adjustScale = {false}
            dropAnimation={{
                duration: 150,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}>
                {overlay && activeItem ? <ItemDisplay customStyleProps={overlayStyleProps} content={activeItem.content} dragIcon={dragIcon} /> : null}
            </DragOverlay>
        </DndContext>
    );
}

export default KanbanBoard;