import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bars3Icon,
    XMarkIcon,
    ChartPieIcon,
    UsersIcon,
    HomeModernIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowRightOnRectangleIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline'

import { useNavigate } from 'react-router-dom'
import { firstCharCapital } from '../components/utils/helper/firstCharCapital'
import EntityManage from '../components/generic/EntityManage'
import { hotelConfig } from '../configs/hotelConfig'
import { userCredentialConfig } from '../configs/userCredentialConfig'




function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}




export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false)
    const [activeTab, setActiveTab] = useState('users')
    const [username, setUsername] = useState('Admin User')
    const [role, setRole] = useState('Guest')
    const navigate = useNavigate();

    // Mock localStorage for demo
    useEffect(() => {
        // In real app, get from localStorage
        const storedUser = localStorage.getItem("Username") || 'Admin User'
        setUsername(firstCharCapital(storedUser))
        const storedRole = localStorage.getItem("Role")
        setRole(storedRole ? firstCharCapital(storedRole) : 'Guest')
    }, [])

    const navigation = [
        {
            name: 'Users',
            tab: 'users',
            icon: UsersIcon,
            current: activeTab === 'users'
        },

        {
            name: 'Hotels',
            tab: 'hotels',
            icon: HomeModernIcon,
            current: activeTab === 'hotels'
        },

    ]

    const firstLetter = username.charAt(0).toUpperCase()
    // Role badge/tag component
    const RoleBadge = ({ role }) => (
        <span
            className={
                role === 'Guest'
                    ? 'inline-block min-w-[40px] px-2 py-0.5 rounded-full bg-gray-600 text-[10px] sm:text-xs text-gray-200 font-semibold mt-1 sm:mt-0 sm:ml-2 text-center'
                    : 'inline-block min-w-[40px] px-2 py-0.5 rounded-full bg-blue-600 text-[10px] sm:text-xs text-white font-semibold mt-1 sm:mt-0 sm:ml-2 text-center'
            }
        >
            {role}
        </span>
    );

    const logout = () => {
        // In real app: localStorage.clear()

        toast.success("Logout SuccessFully", { duration: 2000 })
        navigate('/login')
        localStorage.clear()
    }

    const handleNavClick = (tab) => {
        setActiveTab(tab)
        setSidebarOpen(false) // Close mobile sidebar on nav click
    }

    const renderContent = () => {
        switch (activeTab) {

            case 'users':
                return <EntityManage config={userCredentialConfig} />
            case 'hotels':
                return <EntityManage config={hotelConfig} />


            default:
                return <EntityManage config={userCredentialConfig} />
        }
    }

    // Animation variants
    const sidebarVariants = {
        open: {
            x: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        closed: {
            x: "-100%",
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    }

    const overlayVariants = {
        open: {
            opacity: 1,
            transition: { duration: 0.3 }
        },
        closed: {
            opacity: 0,
            transition: { duration: 0.3 }
        }
    }

    const desktopSidebarVariants = {
        expanded: {
            width: 288, // 18rem
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        collapsed: {
            width: 80, // 5rem
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    }

    const textVariants = {
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.2,
                delay: 0.1
            }
        },
        hidden: {
            opacity: 0,
            scale: 0.8,
            transition: {
                duration: 0.2
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={overlayVariants}
                            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />

                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={sidebarVariants}
                            className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
                        >
                            <div className="flex h-full flex-col bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50">
                                {/* Close button */}
                                <div className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">S</span>
                                        </div>
                                        <span className="text-xl font-bold text-white">Dashboard</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setSidebarOpen(false)}
                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </motion.button>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 px-6 pb-6">
                                    <ul className="space-y-2">
                                        {navigation.map((item, index) => (
                                            <motion.li
                                                key={item.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{
                                                    opacity: 1,
                                                    x: 0,
                                                    transition: { delay: index * 0.1 }
                                                }}
                                            >
                                                <button
                                                    onClick={() => handleNavClick(item.tab)}
                                                    className={classNames(
                                                        item.current
                                                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-blue-500/30'
                                                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white border-transparent',
                                                        'group flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold transition-all w-full border'
                                                    )}
                                                >
                                                    <item.icon className="h-5 w-5 shrink-0" />
                                                    {item.name}
                                                </button>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </nav>

                                {/* User profile & logout */}
                                <div className="border-t border-gray-700/50 p-6 space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-700/30">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-semibold text-white">
                                            {firstLetter}
                                        </div>
                                        <span className="text-gray-300 text-sm flex items-center">{username}<RoleBadge role={role} /></span>


                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={logout}
                                        className="flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-red-500/20"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                        Logout
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <motion.div
                variants={desktopSidebarVariants}
                animate={desktopSidebarCollapsed ? "collapsed" : "expanded"}
                className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 overflow-hidden"
            >
                <div className="flex grow flex-col gap-y-5 px-6 pb-6">
                    {/* Header with toggle button */}
                    <div className="flex h-16 shrink-0 items-center justify-between">
                        <AnimatePresence mode="wait">
                            {!desktopSidebarCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">S</span>
                                    </div>
                                    <span className="text-xl font-bold text-white">Dashboard</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
                            className={classNames(
                                "rounded-lg p-2 text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors",
                                desktopSidebarCollapsed ? "mx-auto" : ""
                            )}
                        >
                            {desktopSidebarCollapsed ? (
                                <ChevronRightIcon className="h-5 w-5" />
                            ) : (
                                <ChevronLeftIcon className="h-5 w-5" />
                            )}
                        </motion.button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-1 flex-col">
                        <ul className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul className="space-y-2">
                                    {navigation.map((item) => (
                                        <li key={item.name}>
                                            <motion.button
                                                onClick={() => handleNavClick(item.tab)}
                                                whileHover={{ scale: 1.02 }}
                                                className={classNames(
                                                    item.current
                                                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-blue-500/30'
                                                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white border-transparent',
                                                    'group flex gap-x-3 rounded-xl p-3 text-sm font-semibold transition-all w-full border',
                                                    desktopSidebarCollapsed ? 'justify-center' : ''
                                                )}
                                                title={desktopSidebarCollapsed ? item.name : undefined}
                                            >
                                                <item.icon className="h-5 w-5 shrink-0" />
                                                <AnimatePresence mode="wait">
                                                    {!desktopSidebarCollapsed && (
                                                        <motion.span
                                                            variants={textVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit="hidden"
                                                        >
                                                            {item.name}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </motion.button>
                                        </li>
                                    ))}
                                </ul>
                            </li>

                            {/* User profile & logout */}
                            <li className="mt-auto space-y-3">
                                <AnimatePresence mode="wait">
                                    {!desktopSidebarCollapsed && (
                                        <motion.div
                                            variants={textVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-700/30"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-semibold text-white">
                                                {firstLetter}
                                            </div>
                                            <span className="text-gray-300 text-sm flex items-center">{username}<RoleBadge role={role} /></span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    onClick={logout}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={classNames(
                                        "flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-red-500/20 w-full",
                                        desktopSidebarCollapsed ? "justify-center" : ""
                                    )}
                                    title={desktopSidebarCollapsed ? "Logout" : undefined}
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
                                    <AnimatePresence mode="wait">
                                        {!desktopSidebarCollapsed && (
                                            <motion.span
                                                variants={textVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                            >
                                                Logout
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </motion.div>

            {/* Mobile header */}
            <div className="sticky top-0 z-40 flex items-center justify-between bg-gray-900/95 backdrop-blur-xl px-4 py-3 border-b border-gray-700/50 lg:hidden">

                {/* Left: Hamburger + Title */}
                <div className="flex items-center space-x-3">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </motion.button>

                    <div className="text-base sm:text-lg font-semibold text-white truncate">
                        Dashboard
                    </div>
                </div>

                {/* Right: User Info */}
                <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm sm:text-base font-semibold text-white">
                        {firstLetter}
                    </div>

                    {/* Username + Role */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 leading-tight">
                        <span className="text-sm sm:text-base text-gray-200 truncate max-w-[120px] sm:max-w-none">
                            {username}
                        </span>
                        <RoleBadge role={role} />
                    </div>
                </div>
            </div>
            {/* Main content */}
            <motion.main
                className={classNames(
                    "transition-all duration-300 ease-in-out py-8",
                    !desktopSidebarCollapsed ? "lg:pl-72" : "lg:pl-20"
                )}
                layout
            >
                <div className="px-4 sm:px-6 lg:px-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.main>
        </div>
    )
}