import * as React from "react";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/utils";

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
    const radius = 100;
    const [visible, setVisible] = React.useState(false);

    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    // 🔑 Password toggle
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    return (
        <motion.div
            style={{
                background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            #3b82f6,
            transparent 80%
          )
        `,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            className="group/input rounded-lg p-[2px] transition duration-300"
        >
            {/* relative wrapper to place icon inside input */}
            <div className="relative w-full">
                <input
                    type={isPassword && showPassword ? "text" : type}
                    className={cn(
                        `shadow-input josefin-sans dark:placeholder-text-neutral-600 flex h-10 w-full rounded-md border-none bg-gray-50 px-3 pr-10 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
                        className
                    )}
                    ref={ref}
                    {...props}
                />

                {/* 👁️ Toggle button inside input bar */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </motion.div>
    );
});
Input.displayName = "Input";

export { Input };
