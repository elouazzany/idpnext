declare module 'react-reorder' {
  import { ComponentType, ReactNode } from 'react';

  export interface ReorderProps {
    reorderId: string;
    reorderGroup?: string;
    getRef?: (ref: HTMLElement | null) => void;
    component?: string | ComponentType<any>;
    placeholderClassName?: string;
    draggedClassName?: string;
    lock?: 'horizontal' | 'vertical';
    holdTime?: number;
    touchHoldTime?: number;
    mouseHoldTime?: number;
    onReorder: (
      event: MouseEvent | TouchEvent,
      previousIndex: number,
      nextIndex: number,
      fromId: string,
      toId: string
    ) => void;
    autoScroll?: boolean;
    disabled?: boolean;
    disableContextMenus?: boolean;
    placeholder?: ReactNode;
    children: ReactNode;
  }

  export default class Reorder extends React.Component<ReorderProps> {}

  export function reorder<T>(list: T[], previousIndex: number, nextIndex: number): T[];
  export function reorderImmutable<T>(list: T[], previousIndex: number, nextIndex: number): T[];
  export function reorderFromTo<T>(
    lists: { from: T[]; to: T[] },
    previousIndex: number,
    nextIndex: number
  ): { from: T[]; to: T[] };
  export function reorderFromToImmutable<T>(
    lists: { from: T[]; to: T[] },
    previousIndex: number,
    nextIndex: number
  ): { from: T[]; to: T[] };
}
