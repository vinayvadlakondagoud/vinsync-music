import { motion } from 'framer-motion';

const Skeleton = ({ className }) => {
    return (
        <div className={`relative overflow-hidden bg-white/5 rounded-xl ${className}`}>
            <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%]"
                animate={{
                    x: ['-100%', '100%'],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
};

export default Skeleton;
