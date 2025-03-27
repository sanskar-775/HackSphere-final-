"use client";

import { motion } from "framer-motion";
import { ClipboardDocumentCheckIcon, CodeBracketSquareIcon, DocumentMagnifyingGlassIcon, TrophyIcon } from "@heroicons/react/24/outline";
import MatrixText from "@/components/ui/MatrixText";

const hackathonFlow = [
    { icon: ClipboardDocumentCheckIcon, description: "Register for the hackathon and form your team." },
    { icon: CodeBracketSquareIcon, description: "Start coding! Develop your project with mentorship support." },
    { icon: DocumentMagnifyingGlassIcon, description: "Submit your project and get it reviewed by judges." },
    { icon: TrophyIcon, description: "Present your project, and winners will be announced!" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
        opacity: 1,
        transition: { staggerChildren: 0.3, delayChildren: 0.2 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { 
        opacity: 1, y: 0, 
        transition: { type: "spring", stiffness: 80, damping: 15 }
    },
    hover: { 
        y: -10, 
        scale: 1.05, 
        transition: { type: "spring", stiffness: 300 } 
    }
};

function HackathonFlow() {
    return (
        <section className="w-full flex flex-col items-center text-center py-16 bg-base-200">
            <motion.h2 
                initial={{ opacity: 0, y: -30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ type: "spring", stiffness: 50 }}
                className="text-3xl font-bold text-primary"
            >
                <MatrixText text="Hackathon Eventflow!" className=" mt-12 text-white-100" />
            </motion.h2>
            <motion.div 
                className="h-1 w-24 bg-gradient-to-r from-green-500 to-blue-500 mt-2"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
            />

            {/* Steps Grid */}
            <motion.div 
                className="grid mt-12 md:grid-cols-4 grid-cols-1 gap-8 max-w-6xl"
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.5 }}
            >
                {hackathonFlow.map((step, index) => (
                    <motion.div 
                        key={index} 
                        className="card w-full bg-base-100 shadow-lg hover:shadow-xl cursor-pointer p-6 rounded-xl flex flex-col items-center"
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <step.icon className="w-12 h-12 text-primary mb-4" />
                        <p className="text-lg text-gray-600">{step.description}</p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}

export default HackathonFlow;
