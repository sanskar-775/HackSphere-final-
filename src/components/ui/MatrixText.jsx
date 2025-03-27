"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MatrixText = ({
  text = "HackSphere",
  className = "",
  letterAnimationDuration = 500,
  letterInterval = 100,
}) => {
  const [letters, setLetters] = useState(() =>
    text.split("").map((char) => ({
      char,
      isMatrix: false,
      isSpace: char === " ",
    }))
  );

  const getRandomChar = useCallback(() => (Math.random() > 0.5 ? "1" : "0"), []);

  const animateLetter = useCallback(
    (index) => {
      if (index >= text.length) return;

      setLetters((prev) => {
        const newLetters = [...prev];
        if (!newLetters[index].isSpace) {
          newLetters[index] = {
            ...newLetters[index],
            char: getRandomChar(),
            isMatrix: true,
          };
        }
        return newLetters;
      });

      setTimeout(() => {
        setLetters((prev) => {
          const newLetters = [...prev];
          newLetters[index] = {
            ...newLetters[index],
            char: text[index],
            isMatrix: false,
          };
          return newLetters;
        });
      }, letterAnimationDuration);
    },
    [getRandomChar, text, letterAnimationDuration]
  );

  const startAnimation = () => {
    let currentIndex = 0;

    const animate = () => {
      if (currentIndex >= text.length) return;
      animateLetter(currentIndex);
      currentIndex++;
      setTimeout(animate, letterInterval);
    };

    animate();
  };

  const motionVariants = useMemo(
    () => ({
      matrix: {
        color: "#00ff00",
        textShadow: "0 2px 4px rgba(0, 255, 0, 0.5)",
      },
    }),
    []
  );

  return (
    <div
      onMouseEnter={startAnimation}
      className={cn(
        "flex items-center justify-center text-black dark:text-white cursor-pointer",
        className
      )}
    >
      <div className="h-24 flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center">
          {letters.map((letter, index) => (
            <motion.div
              key={`${index}-${letter.char}`}
              className="font-mono text-4xl md:text-6xl w-[1ch] text-center overflow-hidden"
              animate={letter.isMatrix ? "matrix" : "normal"}
              variants={motionVariants}
              transition={{
                duration: 0.1,
                ease: "easeInOut",
              }}
              style={{
                display: "inline-block",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {letter.isSpace ? "\u00A0" : letter.char}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatrixText;
