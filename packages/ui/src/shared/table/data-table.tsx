'use client';
'use no memo';
import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  PaginationState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#components/table';
import { Button } from '#components/button';
import { Spinner } from '#components/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#components/select';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';

const useTable = useReactTable;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const table = useTable({
    data,
    columns,
    autoResetPageIndex: false,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-lg border border-border bg-card overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-xs">
            <Spinner className="size-6 text-primary" />
          </div>
        )}
        <Table aria-label="Data Table">
          <TableHeader>
            {table.getFlatHeaders().map((header, index) => (
              <TableHead
                key={header.id}
                id={header.id}
                isRowHeader={index === 0}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableHeader>
          <TableBody
            renderEmptyState={() => (
              <div className="flex h-28 w-full items-center justify-center text-sm text-muted-foreground">
                ไม่พบข้อมูล
              </div>
            )}
          >
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} id={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} id={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            แสดงต่อหน้า
          </span>
          <Select
            aria-label="จำนวนแถวต่อหน้า"
            selectedKey={String(table.getState().pagination.pageSize)}
            onSelectionChange={(key) => {
              if (key) {
                table.setPageSize(Number(key));
              }
            }}
          >
            <SelectTrigger className="h-8 w-18">
              <SelectValue />
            </SelectTrigger>
            <SelectContent placement="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  id={String(pageSize)}
                  textValue={String(pageSize)}
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center text-sm font-medium text-muted-foreground">
            หน้า {table.getState().pagination.pageIndex + 1} จาก{' '}
            {table.getPageCount() || 1}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              className="hidden sm:inline-flex"
              aria-label="ไปยังหน้าแรก"
              onPress={() => table.setPageIndex(0)}
              isDisabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="ไปยังหน้าก่อนหน้า"
              onPress={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="ไปยังหน้าถัดไป"
              onPress={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="hidden sm:inline-flex"
              aria-label="ไปยังหน้าสุดท้าย"
              onPress={() => table.setPageIndex(table.getPageCount() - 1)}
              isDisabled={!table.getCanNextPage()}
            >
              <ChevronsRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
