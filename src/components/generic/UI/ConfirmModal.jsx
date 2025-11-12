import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmModal({
    open = false,                  // controls visibility
    title = "Confirm Action",      // modal title
    message = "Are you sure you want to proceed?", // modal message
    confirmText = "Delete",        // confirm button text
    cancelText = "Cancel",         // cancel button text
    onCancel = () => { },           // cancel handler
    onConfirm = () => { },          // confirm handler
}) {
    if (!open) return null; // don’t render if closed

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50"
                        onClick={onCancel}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                            <p className="text-gray-300 mb-6">{message}</p>
                            <div className="flex gap-3 justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onCancel}
                                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                                >
                                    {cancelText}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onConfirm}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                >
                                    {confirmText}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}


