import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Camera, Save, LogOut } from 'lucide-react';
import { useState } from 'react';
import StatsDashboard from '../components/StatsDashboard';

const ProfileView = () => {
    const { user, updateProfile, logout } = useAuth();
    
    // Extract metadata safely
    const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    const avatar = user?.user_metadata?.avatar || null;

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: displayName,
            email: user?.email || '',
            password: ''
        }
    });

    const [isEditing, setIsEditing] = useState(false);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                <p className="text-zinc-400">Please sign in to access your profile settings.</p>
            </div>
        );
    }

    const onSubmit = (data) => {
        // Only update fields that changed/are present
        const updates = { name: data.name };
        if (data.password) updates.password = data.password;
        
        updateProfile(updates);
        setIsEditing(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
             // Limit size to 500KB
             if (file.size > 500 * 1024) {
                 alert("Image too large! Please choose an image under 500KB.");
                 return;
             }
             
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfile({ avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pt-4 md:pt-8 pb-24 px-3 md:px-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Account Settings</h1>

            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 mb-8 text-center md:text-left">
                        {/* Avatar Upload */}
                        <div className="relative group cursor-pointer flex-shrink-0">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white/10 shadow-xl mx-auto">
                                {avatar ? (
                                    <img src={avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-4xl font-bold text-zinc-600 uppercase">
                                        {displayName[0]}
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                <Camera className="text-white" size={24} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
                            <p className="text-zinc-400 text-sm">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-cyan-600/20 to-emerald-400/20 text-cyan-200 text-xs font-bold rounded-full border border-cyan-500/20">
                                PREMIUM MEMBER
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-1.5 md:space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                                <input 
                                    {...register("name", { required: "Name is required" })}
                                    disabled={!isEditing}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                />
                                {errors.name && <span className="text-red-400 text-xs">{errors.name.message}</span>}
                            </div>

                            <div className="space-y-1.5 md:space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email (Locked)</label>
                                <input 
                                    {...register("email")}
                                    disabled
                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                {isEditing ? "New Password" : "Password"}
                            </label>
                            <input 
                                {...register("password", { minLength: { value: 6, message: "Min 6 chars" } })}
                                type="password"
                                disabled={!isEditing}
                                placeholder={isEditing ? "Leave blank to keep current" : "••••••••"}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            {errors.password && <span className="text-red-400 text-xs">{errors.password.message}</span>}
                        </div>

                        <div className="pt-4 flex flex-col-reverse md:flex-row items-center md:justify-between gap-4 border-t border-white/5 mt-6 md:mt-8">
                             <button
                                type="button" 
                                onClick={logout}
                                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors font-medium text-sm w-full md:w-auto justify-center md:justify-start py-2"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>

                            {isEditing ? (
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 md:flex-none px-6 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors font-medium text-center"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 md:flex-none px-6 py-2 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="w-full md:w-auto px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="mt-8">
                <StatsDashboard />
            </div>
        </div>
    );
};

export default ProfileView;
