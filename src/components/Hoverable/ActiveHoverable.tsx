import {cloneElement, forwardRef, Ref, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import CONST from '@src/CONST';
import HoverableProps from './types';

type ActiveHoverableProps = Omit<HoverableProps, 'disabled'>;

// TODO: Do we really need distinction between onHover* and onMouse*?

function ActiveHoverable<R>({onHoverIn, onHoverOut, shouldHandleScroll, children, ...props}: ActiveHoverableProps, ref: Ref<R>) {
    const [isHovered, setIsHovered] = useState(false);
    const isScrolling = useRef(false);
    const isHoveredRef = useRef(false);

    const updateIsHovered = useCallback(
        (hovered: boolean) => {
            isHoveredRef.current = hovered;
            if (shouldHandleScroll && isScrolling.current) {
                return;
            }
            setIsHovered(hovered);
        },
        [shouldHandleScroll],
    );

    useEffect(() => (isHovered ? onHoverIn?.() : onHoverOut?.()), [isHovered, onHoverIn, onHoverOut]);

    useEffect(() => {
        if (!shouldHandleScroll) {
            return;
        }

        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (scrolling) => {
            isScrolling.current = scrolling;
            if (!isScrolling.current) {
                setIsHovered(isHoveredRef.current);
            }
        });

        return () => scrollingListener.remove();
    }, [shouldHandleScroll]);

    const child = useMemo(() => (typeof children === 'function' ? children(!isScrolling.current && isHovered) : children), [children, isHovered]);

    const onMouseEnter = useCallback(
        (e: MouseEvent) => {
            updateIsHovered(true);
            props.onMouseEnter?.(e);
            child.props.onMouseEnter?.(e);
        },
        [updateIsHovered, props, child.props],
    );

    const onMouseLeave = useCallback(
        (e: MouseEvent) => {
            updateIsHovered(false);
            props.onMouseLeave?.(e);
            child.props.onMouseLeave?.(e);
        },
        [updateIsHovered, props, child.props],
    );

    return cloneElement(child, {
        ref,
        onMouseEnter,
        onMouseLeave,
    });
}

export default forwardRef(ActiveHoverable);
