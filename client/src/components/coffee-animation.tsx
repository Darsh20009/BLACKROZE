import { motion } from "framer-motion";

export default function CoffeeAnimation() {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* The Cup */}
      <div className="absolute bottom-8 w-40 h-28 border-4 border-white/40 border-t-0 rounded-b-[48px] bg-white/10 backdrop-blur-md shadow-2xl">
        {/* Handle */}
        <div className="absolute -right-8 top-6 w-10 h-14 border-4 border-white/40 border-l-0 rounded-r-full" />
        
        {/* Coffee Level Rising */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "85%" }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 right-0 bg-[#3d2b1f] rounded-b-[44px]"
        />
        
        {/* Steam Effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: [0, 0.4, 0], y: -30 }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                delay: i * 0.8,
                ease: "easeOut" 
              }}
              className="w-2 h-10 bg-white/30 rounded-full blur-[3px]"
            />
          ))}
        </div>
      </div>

      {/* The Pouring Coffee Stream */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "180px", opacity: [0, 1, 1, 0] }}
        transition={{ 
          duration: 3.5, 
          times: [0, 0.1, 0.9, 1],
          ease: "linear" 
        }}
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-3 bg-[#4a3427] rounded-full z-20 shadow-lg"
      >
        {/* Shine on the stream */}
        <div className="absolute inset-y-0 left-1 w-1 bg-white/10 rounded-full" />
      </motion.div>

      {/* Splash Effect at contact point */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 0], opacity: [0, 0.6, 0] }}
        transition={{ 
          duration: 0.4, 
          repeat: 8,
          repeatType: "loop"
        }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#3d2b1f] rounded-full blur-[1px] z-30"
      />
    </div>
  );
}
