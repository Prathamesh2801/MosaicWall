import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Edit, Eye, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

import ConfirmModal from './UI/ConfirmModal';

export default function EntityRecords({
  fields = [],
  items = [],
  loading = false,
  onEdit,
  onView,
  onDelete,
  onRefresh,
  idField
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const gridRef = useRef();

  // Debug logging
  useEffect(() => {
    console.log('EntityRecords render:', {
      fieldsCount: fields.length,
      itemsCount: items.length,
      items: items,
      loading,
      idField
    });
  }, [fields, items, loading, idField]);



  const ActionRenderer = useCallback((params) => {
    if (!params.data) return null;

    const handleView = () => {
      console.log('View clicked for:', params.data);
      onView(params.data);
    };

    const handleEdit = () => {
      console.log('Edit clicked for:', params.data);
      onEdit(params.data);
    };

    const handleDelete = () => {
      console.log('Delete clicked for:', params.data);
      setDeleteConfirm(params.data);
    };

    return (
      <div className="flex items-center justify-center space-x-2 h-full py-2">
        <motion.button
          onClick={handleView}
          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </motion.button>
        <motion.button
          onClick={handleEdit}
          className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </motion.button>
        <motion.button
          onClick={handleDelete}
          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    );
  }, [onView, onEdit]);

  const columnDefs = useMemo(() => {
    console.log('Building column definitions for fields:', fields);

    if (!fields || fields.length === 0) {
      console.warn('No fields provided for column definitions');
      return [];
    }

    const cols = fields
      .filter(f => f.showInGrid !== false) // Show field unless explicitly hidden
      .map(f => {
        const colDef = {
          headerName: f.label,
          field: f.name,
          sortable: true,
          filter: true,
          resizable: true,
          minWidth: f.minWidth || 150,
          flex: f.flex || 1,
          hide: f.hidden || false,
        };

        // Add custom cell renderer if provided
        if (f.cellRenderer) {
          colDef.cellRenderer = f.cellRenderer;
        }

        // Add value formatter if provided
        if (f.valueFormatter) {
          colDef.valueFormatter = f.valueFormatter;
        }

        // Special handling for date fields
        if (f.type === 'date' || f.type === 'datetime-local' || f.name.includes('_At')) {
          colDef.valueFormatter = (params) => {
            if (params.value) {
              try {
                const date = new Date(params.value);
                return date.toLocaleString();
              } catch (e) {
                return params.value;
              }
            }
            return '';
          };
        }

        // Special handling for boolean fields
        if (f.type === 'checkbox') {
          colDef.cellRenderer = (params) => {
            return params.value ?
              '<span class="text-green-400">✓ Yes</span>' :
              '<span class="text-gray-400">✗ No</span>';
          };
        }

        console.log('Created column definition:', colDef);
        return colDef;
      });

    // Add actions column
    cols.push({
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: ActionRenderer,
      width: 140,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      suppressSizeToFit: true,
    });

    console.log('Final column definitions:', cols);
    return cols;
  }, [fields, ActionRenderer]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
  }), []);

  const onGridReady = useCallback((params) => {
    console.log('Grid ready with params:', params);
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    // ❌ Remove: params.api.setRowData(items);

    // ✅ Just size columns
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 100);
  }, [items]);

  const handleDeleteConfirm = async () => {
    if (deleteConfirm && onDelete) {
      try {
        console.log('Confirming delete for:', deleteConfirm);
        await onDelete(deleteConfirm);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Delete error:', error);
        setDeleteConfirm(null);
      }
    }
  };

  // Get display name for delete confirmation
  const getDisplayName = (item) => {
    if (!item) return '';

    // Try common name fields first
    const nameFields = ['name', 'title', 'Hotel_Name', 'username', 'email', 'label'];
    for (const field of nameFields) {
      if (item[field]) return item[field];
    }

    // Try the second field in the config (usually the name field)
    if (fields && fields.length > 1 && item[fields[1].name]) {
      return item[fields[1].name];
    }

    // Fall back to ID
    return item[idField] || 'this item';
  };

  const gridOptions = useMemo(() => ({
    animateRows: true,
    rowSelection: 'single',
    suppressRowClickSelection: true,
    enableRangeSelection: false,
    enableCellTextSelection: true,
    suppressMenuHide: false,
    defaultColDef,
    getRowId: (params) => {
      // Use the configured ID field or fall back to index
      return params.data[idField] || params.node.rowIndex;
    },
  }), [defaultColDef, idField]);

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="flex items-center justify-center text-gray-300 p-8">
      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-3"></div>
      <span>Loading data...</span>
    </div>
  );

  // No data overlay component
  const NoDataOverlay = () => (
    <div className="flex flex-col items-center justify-center text-gray-400 p-8">
      <div className="text-4xl mb-4">📋</div>
      <div className="text-lg mb-2">No records found</div>
      <div className="text-sm">Create your first record to get started</div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-300 text-xs">
          <strong>Debug Info:</strong> Fields: {fields.length}, Items: {items.length}, Loading: {loading.toString()}
        </div>
      )}

      {/* Header with stats and refresh */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-gray-200 font-medium">
            Total: <span className="text-white font-bold">{items?.length || 0}</span> records
          </div>
          {loading && (
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>

        <motion.button
          onClick={onRefresh}
          className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Refresh data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </motion.button>
      </div>

      {/* AG Grid Container */}
      <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
        <div
          className="h-[600px] ag-theme-alpine-dark w-full"
          style={{
            '--ag-background-color': 'rgba(31, 41, 55, 0.8)',
            '--ag-header-background-color': 'rgba(55, 65, 81, 0.9)',
            '--ag-odd-row-background-color': 'rgba(31, 41, 55, 0.4)',
            '--ag-row-hover-color': 'rgba(59, 130, 246, 0.1)',
            '--ag-selected-row-background-color': 'rgba(59, 130, 246, 0.2)',
            '--ag-foreground-color': '#E5E7EB',
            '--ag-header-foreground-color': '#F3F4F6',
            '--ag-border-color': 'rgba(75, 85, 99, 0.3)',
            '--ag-cell-horizontal-border': 'rgba(75, 85, 99, 0.2)',
            '--ag-row-border-color': 'rgba(75, 85, 99, 0.2)',
          }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={items || []}
            columnDefs={columnDefs}
            gridOptions={gridOptions}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowHeight={56}
            headerHeight={48}
            onGridReady={onGridReady}
            loadingOverlayComponent={LoadingOverlay}
            noRowsOverlayComponent={NoDataOverlay}
            suppressLoadingOverlay={!loading}
            suppressNoRowsOverlay={loading || (items && items.length > 0)}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${getDisplayName(deleteConfirm)}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}