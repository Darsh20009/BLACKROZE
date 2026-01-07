import { motion } from "framer-motion";

export default function ButtonPourAnimation() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden rounded-xl">
      {/* Coffee Filling from Bottom */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 right-0 bg-[#3d2b1f]/90 z-0"
      />
      
      {/* Pouring Stream Effect */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "100%", opacity: [0, 1, 1, 0] }}
        transition={{ 
          duration: 3.5, 
          times: [0, 0.1, 0.9, 1],
          ease: "linear" 
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 bg-[#4a3427] z-10"
      >
        <div className="absolute inset-y-0 left-0.5 w-0.5 bg-white/10" />
      </motion.div>

      {/* Surface Bubbles/Foam Effect at the rising level */}
      <motion.div
        initial={{ bottom: 0 }}
        animate={{ bottom: "100%" }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="absolute left-0 right-0 h-2 bg-[#5c3d2e] blur-[2px] z-5"
      />
    </div>
  );
}
