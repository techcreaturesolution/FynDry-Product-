import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, AlertCircle, Check } from 'lucide-react';
import Pagination from '../ui/Pagination';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId = (row) => row._id || row.id,
  bulkActions = [],
  searchable = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  pagination,
  emptyMessage = 'No records found matching your filters.',
  className = '',
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const allIds = data.map(getRowId);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data if sortable is enabled on client-side
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortConfig]);

  const allSelected = data.length > 0 && data.every((row) => selectedIds.includes(getRowId(row)));
  const someSelected = data.some((row) => selectedIds.includes(getRowId(row))) && !allSelected;

  return (
    <div className={`space-y-4 font-body ${className}`}>
      {/* Top Controls: Search & Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {searchable && (
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-white rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:border-primary shadow-xs transition-colors"
            />
          </div>
        )}

        {/* Bulk Action Bar when rows are selected */}
        {selectable && selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-primary animate-fade-in">
            <span>{selectedIds.length} item(s) selected</span>
            <div className="h-4 w-px bg-primary/20 mx-1" />
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => action.onClick(selectedIds)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors ${
                  action.variant === 'danger'
                    ? 'bg-brandRed text-white hover:bg-brandRed/90'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                {selectable && (
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`py-3.5 px-4 ${
                      col.sortable ? 'cursor-pointer select-none hover:text-gray-900' : ''
                    } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right'
                          ? 'justify-end w-full'
                          : col.align === 'center'
                          ? 'justify-center w-full'
                          : ''
                      }`}
                    >
                      <span>{col.label}</span>
                      {col.sortable && sortConfig.key === col.key && (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-primary" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {selectable && (
                      <td className="py-4 px-4">
                        <div className="w-4 h-4 bg-gray-200 rounded" />
                      </td>
                    )}
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="py-16 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-gray-300" />
                      <p className="text-xs font-bold text-gray-500">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((row, rIdx) => {
                  const rowId = getRowId(row);
                  const isSelected = selectedIds.includes(rowId);

                  return (
                    <tr
                      key={rowId || rIdx}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isSelected ? 'bg-primary-50/30' : ''
                      }`}
                    >
                      {selectable && (
                        <td className="py-3.5 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(rowId)}
                            className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`py-3.5 px-4 ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }`}
                        >
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-gray-500 font-medium">
              Showing page <span className="font-bold text-gray-900">{pagination.page}</span> of{' '}
              <span className="font-bold text-gray-900">{pagination.totalPages}</span>
              {pagination.totalCount !== undefined && ` (${pagination.totalCount} total entries)`}
            </p>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
