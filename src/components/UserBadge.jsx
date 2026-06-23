import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserBadge = ({ setCurrentView, collapsed = false }) => {
    const { user, openAuthModal } = useAuth();

    const handleClick = () => {
        if (user) {
            setCurrentView('profile');
        } else {
            openAuthModal();
        }
    };

    if (collapsed) {
        return (
            <button 
                onClick={handleClick}
                className="w-12 h-12 rounded-full relative group transition-transform hover:scale-105"
            >
                <div className="w-full h-full rounded-2xl bg-zinc-800 overflow-hidden flex items-center justify-center border border-white/10 shadow-lg">
                    {user?.user_metadata?.avatar ? (
                        <img src={user.user_metadata.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <User size={20} className="text-zinc-400 group-hover:text-white" />
                    )}
                </div>
                {/* Status Dot */}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#121212] ${user ? 'bg-cyan-400' : 'bg-zinc-600'}`} />
            </button>
        );
    }

    return (
        <button 
            onClick={handleClick}
            className="flex items-center gap-3 w-full bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all group backdrop-blur-md border border-white/5"
        >
            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                {user?.user_metadata?.avatar ? (
                    <img src={user.user_metadata.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <User size={20} className="text-zinc-400 group-hover:text-white" />
                )}
            </div>
            <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-bold text-white truncate max-w-[120px]">
                    {user ? (user.user_metadata?.name || user.email?.split('@')[0]) : 'Sign In'}
                </span>
                <span className="text-xs text-zinc-500 font-medium truncate max-w-[120px]">
                    {user ? 'Premium Member' : 'Join Reverb'}
                </span>
            </div>
        </button>
    );
};

export default UserBadge;
