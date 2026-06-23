import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, signup } = useAuth();
    const { register, handleSubmit, formState: { errors }, reset, setError } = useForm();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        // Simulate network delay for "Premium" feel
        await new Promise(resolve => setTimeout(resolve, 800));

        let result;
        if (isLogin) {
            result = await login(data.email, data.password);
        } else {
            result = await signup(data);
        }

        setIsLoading(false);

        if (result && result.success) {
            onClose();
            reset();
        } else {
            let message = result?.message || 'An error occurred';
            if (message.includes('User already registered') || message.includes('Email already in use')) {
                message = 'This email is already registered. Try logging in instead.';
            } else if (message.includes('Email rate limit exceeded') || message.includes('too many requests')) {
                message = 'Too many attempts. Please wait a few minutes and try again.';
            }
            setError('root', { message });
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        reset();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-2xl shadow-black/50 overflow-hidden"
                    >
                        {/* Decorative Gradients */}
                        <div className="absolute top-[-50%] left-[-50%] w-[100%] h-[100%] bg-purple-600/30 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                        <div className="absolute bottom-[-50%] right-[-50%] w-[100%] h-[100%] bg-pink-600/30 rounded-full blur-[80px] pointer-events-none animate-pulse delay-1000" />

                        <div className="relative p-8 z-10">
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight mb-2">
                                    {isLogin ? 'Welcome Back' : 'Join Reverb'}
                                </h2>
                                <p className="text-zinc-400 text-sm">
                                    {isLogin ? 'Enter your details to access your library.' : 'Start your premium audio journey today.'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {!isLogin && (
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                            <input 
                                                {...register("name", { required: "Name is required" })}
                                                type="text" 
                                                placeholder="Full Name"
                                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                            />
                                        </div>
                                        {errors.name && <span className="text-red-400 text-xs ml-4">{errors.name.message}</span>}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                        <input 
                                            {...register("email", { 
                                                required: "Email is required",
                                                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                            })}
                                            type="email" 
                                            placeholder="Email Address"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                        />
                                    </div>
                                    {errors.email && <span className="text-red-400 text-xs ml-4">{errors.email.message}</span>}
                                </div>

                                <div className="space-y-1">
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                        <input 
                                            {...register("password", { 
                                                required: "Password is required",
                                                minLength: { value: 6, message: "Min 6 characters" }
                                            })}
                                            type="password" 
                                            placeholder="Password"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                        />
                                    </div>
                                    {errors.password && <span className="text-red-400 text-xs ml-4">{errors.password.message}</span>}
                                </div>

                                {errors.root && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-xl">{errors.root.message}</div>}

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-white text-black font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                                    {!isLoading && <ArrowRight size={20} />}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-zinc-400 text-sm">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button onClick={toggleMode} className="text-white font-semibold hover:underline">
                                        {isLogin ? 'Sign up' : 'Log in'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
