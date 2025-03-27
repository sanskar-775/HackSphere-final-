import { motion } from "framer-motion";

export default function SkeletonEventCard() {
  return (
    <motion.div
      className="rounded-xl bg-white/10 backdrop-blur-md p-4 shadow-lg animate-pulse flex flex-col gap-4 h-64"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gray-300/30 rounded-md h-32 w-full shimmer" />
      <div className="h-4 bg-gray-400/30 rounded w-3/4 shimmer" />
      <div className="h-4 bg-gray-400/30 rounded w-1/2 shimmer" />
      <div className="h-8 bg-gray-500/30 rounded w-full mt-auto shimmer" />
    </motion.div>
  );
}
