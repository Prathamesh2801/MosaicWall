import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, RefreshCw } from 'lucide-react';
import EntityRecords from './EntityRecords';
import EntityForm from './EntityForm';
import toast from 'react-hot-toast';

export default function EntityManage({ config }) {
  const [view, setView] = useState('records'); // 'records' | 'form'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [lastFetch, setLastFetch] = useState(null);

  // Add ref to force re-render when needed
  const recordsKey = useRef(0);

  const fetchItems = useCallback(async (filters = {}, force = false) => {
    // Prevent unnecessary fetches unless forced
    if (!force && loading) {
      console.log('Already loading, skipping fetch');
      return;
    }

    console.log('=== FETCHING ITEMS ===');
    console.log('Config:', config);
    console.log('Filters:', filters);
    console.log('Force:', force);

    setLoading(true);

    try {
      const res = await config.api.getAll(filters);
      console.log('=== API RESPONSE ===');
      console.log('Raw response:', res);
      console.log('Response type:', typeof res);
      console.log('Response status:', res?.Status || res?.status);

      // Handle different response formats
      let isSuccess = false;
      let data = [];
      let message = '';

      // Check for success status (handle both formats)
      if (res?.Status === true || res?.status === true || res?.Status === 'true' || res?.status === 'true') {
        isSuccess = true;
        data = res.Data || res.data || res.result || [];
        message = res.Message || res.message || 'Data fetched successfully';
      } else if (res?.success === true) {
        isSuccess = true;
        data = res.data || res.result || [];
        message = res.message || 'Data fetched successfully';
      } else if (Array.isArray(res)) {
        // Direct array response
        isSuccess = true;
        data = res;
        message = 'Data fetched successfully';
      } else if (res && typeof res === 'object' && !res.hasOwnProperty('Status') && !res.hasOwnProperty('status')) {
        // Object response without status field
        isSuccess = true;
        data = [res];
        message = 'Data fetched successfully';
      }

      console.log('=== PROCESSED RESPONSE ===');
      console.log('Is Success:', isSuccess);
      console.log('Data:', data);
      console.log('Data type:', typeof data);
      console.log('Is Array:', Array.isArray(data));
      console.log('Data length:', data?.length);

      if (isSuccess) {
        // Ensure data is an array
        const finalData = Array.isArray(data) ? data : [];
        console.log('Setting items:', finalData);

        setItems(finalData);
        setLastFetch(new Date().toISOString());

        if (finalData.length === 0) {
          console.log('No data received, showing empty state');
        } else {
          console.log(`Successfully loaded ${finalData.length} items`);
        }
      } else {
        console.warn('API returned unsuccessful status');
        const errorMsg = res?.Message || res?.message || res?.error || 'Failed to fetch items';
        console.error('Error message:', errorMsg);
        toast.error(errorMsg);
        setItems([]);
      }
    } catch (err) {
      console.error('=== FETCH ERROR ===');
      console.error('Error details:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);

      toast.error(`Error fetching ${config.entity.toLowerCase()}s: ${err.message}`);
      setItems([]);
    } finally {
      setLoading(false);
      console.log('=== FETCH COMPLETE ===');
    }
  }, [config, loading]);

  // Initial load
  useEffect(() => {
    console.log('=== INITIAL LOAD ===');
    console.log('Component mounted, fetching items');
    fetchItems({}, true);
  }, [fetchItems]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('=== STATE UPDATE ===');
    console.log('Items count:', items.length);
    console.log('Items:', items);
    console.log('View:', view);
    console.log('Loading:', loading);
    console.log('Last fetch:', lastFetch);
  }, [items, view, loading, lastFetch]);

  const handleNew = () => {
    console.log('=== HANDLE NEW ===');
    setCurrent(null);
    setFormMode('create');
    setView('form');
  };

  const handleEdit = (row) => {
    console.log('=== HANDLE EDIT ===');
    console.log('Row data:', row);
    setCurrent(row);
    setFormMode('edit');
    setView('form');
  };

  const handleView = (row) => {
    console.log('=== HANDLE VIEW ===');
    console.log('Row data:', row);
    setCurrent(row);
    setFormMode('view');
    setView('form');
  };

  const handleDelete = async (row) => {
    console.log('=== HANDLE DELETE ===');
    console.log('Row data:', row);

    const idField = config.idField || config.fields[0]?.name;
    const id = row[idField];

    console.log('ID Field:', idField);
    console.log('ID Value:', id);

    if (!id && id !== 0) {
      console.error('ID not found for deletion');
      toast.error('ID not found');
      return;
    }

    try {
      console.log('Calling delete API with ID:', id);
      const res = await config.api.delete(id);
      console.log('Delete response:', res);

      if (res?.Status === true || res?.status === true) {
        const message = res.Message || res.message || `${config.entity} deleted successfully`;
        toast.success(message);
        console.log('Delete successful, refreshing data');

        // Force refresh after successful deletion
        await fetchItems({}, true);
        recordsKey.current += 1; // Force re-render
      } else {
        const errorMsg = res?.Message || res?.message || 'Delete failed';
        console.error('Delete failed:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(`Error deleting ${config.entity.toLowerCase()}`);
    }
  };

  const handleSubmit = async (formData) => {
    console.log('=== HANDLE SUBMIT ===');
    console.log('Form mode:', formMode);
    console.log('Form data:', formData);

    try {
      let res;
      if (formMode === 'edit') {
        res = await config.api.update(formData);
        console.log("Edited Message ", res)

      } else {
        res = await config.api.create(formData);
        console.log("Created Message ", res)
      }

      console.log('Submit response:', res);

      if (res?.Status === true || res?.status === true) {
        const action = formMode === 'edit' ? 'updated' : 'created';
        const message = res.Message || res.message || `${config.entity} ${action} successfully`;
        console.log("Success Granted ", message)
        toast.success(message);

        console.log('Submit successful, refreshing and returning to records');

        // Force refresh and go back to records
        await fetchItems({}, true);
        recordsKey.current += 1; // Force re-render
        setView('records');
        setCurrent(null);
        setFormMode('create');
      } else {
        const action = formMode === 'edit' ? 'update' : 'create';
        const errorMsg = res?.Message || res?.message || `Failed to ${action} ${config.entity}`;
        console.error('Submit failed:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Submit error:', err);
      const action = formMode === 'edit' ? 'updating' : 'creating';
      toast.error(`Error ${action} ${config.entity.toLowerCase()}: ${err.message}`);
    }
  };

  const handleBackToRecords = async () => {
    console.log('=== HANDLE BACK TO RECORDS ===');
    setView('records');
    setCurrent(null);
    setFormMode('create');

    // Refresh data when going back to ensure it's up to date
    await fetchItems({}, true);
    recordsKey.current += 1; // Force re-render
  };

  const handleRefresh = async () => {
    console.log('=== HANDLE REFRESH ===');
    await fetchItems({}, true);
    recordsKey.current += 1; // Force re-render
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 md:p-6 shadow-2xl space-y-4 sm:space-y-0">

              {/* Left Section: Entity Info */}
              <div className="flex items-center space-x-3">
                {view === 'form' && (
                  <motion.button
                    onClick={handleBackToRecords}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Back to records"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </motion.button>
                )}

                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                  <span className="text-white font-semibold text-sm">
                    {config.entity?.slice(0, 2).toUpperCase() || 'EN'}
                  </span>
                </div>

                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                    {config.entity} Management
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1">
                    {view === 'records'
                      ? `Manage your ${config.entity.toLowerCase()}s`
                      : formMode === 'view'
                        ? 'View details'
                        : formMode === 'edit'
                          ? 'Edit details'
                          : 'Create new record'
                    }
                    {view === 'records' && items.length > 0 && (
                      <span className="text-blue-300 ml-1 sm:ml-2">({items.length})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Section: Actions */}
              <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                {view === 'records' && (
                  <>
                    <motion.button
                      onClick={handleRefresh}
                      disabled={loading}
                      className="p-2 sm:p-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Refresh data"
                    >
                      <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </motion.button>

                    <motion.button
                      onClick={handleNew}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-1.5 sm:space-x-2 shadow-md text-sm sm:text-base"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden xs:inline sm:inline-block">
                        Add {config.entity}
                      </span>
                      <span className="xs:hidden">New</span>
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Debug Panel (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-xs text-gray-300">
              <div><strong>Debug:</strong> View: {view} | Items: {items.length} | Loading: {loading.toString()}</div>
              <div>Last Fetch: {lastFetch || 'Never'} | Records Key: {recordsKey.current}</div>
              {items.length > 0 && (
                <div>Sample Item: {JSON.stringify(items[0], null, 2).substring(0, 100)}...</div>
              )}
            </div>
          )}

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {view === 'records' ? (
              <motion.div
                key={`records-${recordsKey.current}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EntityRecords
                  fields={config.fields}
                  items={items}
                  loading={loading}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                  onRefresh={handleRefresh}
                  idField={config.idField}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <EntityForm
                  fields={config.fields}
                  mode={formMode}
                  data={current}
                  onSubmit={handleSubmit}
                  onCancel={handleBackToRecords}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}