"use client";
import { useState } from "react";

import { motion } from "framer-motion";
// import DotGrid from "../components/ui/backgroundParticles/DotGrid.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "../components/utils/utils.js";
import { Label } from "../components/generic/UI/Label.jsx";
import { Input } from "../components/generic/UI/Input.jsx";
import { loginSA } from "../api/Auth.js";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault();

        const minDelay = 1000;
        const startTime = Date.now();

        await toast.promise(
            (async () => {
                const result = await loginSA(username, password);

                // Ensure the toast stays visible at least `minDelay` ms
                const elapsed = Date.now() - startTime;
                if (elapsed < minDelay) {
                    await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
                }

                if (!result.Status) {
                    throw new Error(result.Message || "Login failed");
                }

                localStorage.setItem("Username", username)
                if (result.Role === "Super_Admin") {
                    navigate("/sa/dashboard");
                }
                else if (result.Role === "Hotel_Admin") {
                    navigate("/hotelAdmin/dashboard");
                }
                else {
                    navigate("/hotelStaff/dashboard");
                }



                return result;
            })(),
            {
                loading: "Submitting...",
                success: (result) => result.Message || "Login successful!",
                error: (err) => err.message || "Something went wrong",
            }
        );
    };
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative min-h-screen flex items-center justify-center p-4"
        >
            {/* 3D Background */}
            {/* <div className="absolute inset-0 bg-black">
                <DotGrid
                    dotSize={5}
                    gap={15}
                    baseColor="#271e37"
                    activeColor="#5227ff"
                    proximity={120}
                    shockRadius={250}
                    shockStrength={5}
                    resistance={750}
                    returnDuration={1.5}
                />
            </div> */}

            <motion.div
                className="relative w-full max-w-lg mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
                <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
                    <h2 className="text-2xl  bungee-regular text-neutral-800 tracking-wider dark:text-neutral-200">
                        Welcome <span className="mx-2">  to </span> Dinemaster
                    </h2>

                    <form className="my-8" onSubmit={handleSubmit}>
                        <LabelInputContainer className="mb-4">
                            <Label htmlFor="username">UserName</Label>
                            <Input
                                id="username"
                                placeholder="Enter your username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </LabelInputContainer>

                        <LabelInputContainer className="mb-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                placeholder="Enter your password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </LabelInputContainer>

                        <button
                            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600  text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                            type="submit"
                        >
                            Login &rarr;
                            <BottomGradient />
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
}

const BottomGradient = () => (
    <>
        <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
        <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
);

const LabelInputContainer = ({ children, className }) => (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
        {children}
    </div>
);
