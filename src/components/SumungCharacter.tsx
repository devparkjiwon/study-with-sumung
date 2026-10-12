import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyState } from '../types';

interface SumungCharacterProps {
  state: StudyState;
  elapsedSeconds: number;
  lastRecordDuration?: number;
  silenceRemainingSeconds?: number;
  isCelebrating?: boolean;
}

export const SumungCharacter: React.FC<SumungCharacterProps> = ({
  state,
  elapsedSeconds,
  lastRecordDuration,
  silenceRemainingSeconds = 5,
  isCelebrating = false,
}) => {
  const [speech, setSpeech] = useState<string>('수뭉이가 지켜보고 있어! 👀');

  // Compute dynamic speech bubble text based on state and elapsed time
  useEffect(() => {
    if (isCelebrating) {
      setSpeech('와아아! 대단해! 축하해! 🎉✨');
      return;
    }

    switch (state) {
      case 'IDLE':
        setSpeech('공부할 준비가 되면 시작을 눌러줘! 🐾');
        break;

      case 'COUNTDOWN':
        setSpeech('마우스에서 손을 떼고 준비해! 👀');
        break;

      case 'FOCUSING': {
        const mins = Math.floor(elapsedSeconds / 60);
        if (mins < 3) {
          setSpeech('수뭉이가 지켜보고 있어! 마우스 금지! 👀');
        } else if (mins < 10) {
          setSpeech('잘하고 있어! 계속 집중해 봐. 🐾');
        } else if (mins < 25) {
          setSpeech('좋은 페이스야! 조금만 더 힘내자 ❄️');
        } else if (mins < 50) {
          setSpeech('뽀모도로 달성! 집중력 최고야 🏆');
        } else {
          setSpeech('시험 A+ 예약 완료! 엄청난 몰입이야! 🎓✨');
        }
        break;
      }

      case 'INTERRUPTED':
        setSpeech('어라? 마우스 움직였다! 👀');
        break;

      case 'WAITING':
        setSpeech(`마우스를 멈추면 ${silenceRemainingSeconds}초 후 자동 시작해! ⏳`);
        break;
    }
  }, [state, elapsedSeconds, isCelebrating, silenceRemainingSeconds]);

  // Determine which asset image to show (PNG first)
  const getAssetSrc = () => {
    if (isCelebrating) return './assets/sumung/sumung_celebrate.png';
    switch (state) {
      case 'FOCUSING':
        return './assets/sumung/sumung_focus.png';
      case 'INTERRUPTED':
        return './assets/sumung/sumung_shocked.png';
      case 'WAITING':
      case 'COUNTDOWN':
        return './assets/sumung/sumung_waiting.png';
      case 'IDLE':
      default:
        return './assets/sumung/sumung_idle.png';
    }
  };

  // Animation variants
  const getAnimation = () => {
    if (isCelebrating) {
      return {
        y: [0, -18, 0, -14, 0],
        rotate: [0, -4, 4, -3, 0],
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
      };
    }
    switch (state) {
      case 'FOCUSING':
        return {
          y: [0, -4, 0],
          scale: [1, 1.015, 1],
          transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'INTERRUPTED':
        return {
          x: [0, -8, 8, -6, 6, -3, 3, 0],
          y: [0, -6, 0],
          scale: [1, 1.08, 1],
          transition: { duration: 0.6, ease: 'easeOut' },
        };
      case 'WAITING':
        return {
          rotate: [0, -2, 2, 0],
          y: [0, -5, 0],
          transition: { duration: 2.0, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'COUNTDOWN':
        return {
          scale: [1, 1.05, 1],
          transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'IDLE':
      default:
        return {
          y: [0, -6, 0],
          transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
        };
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Dynamic Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={speech}
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.22 }}
          className="relative mb-3 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-mung-200 dark:border-mung-800 shadow-md shadow-mung-100/50 dark:shadow-none max-w-sm text-center"
        >
          <p className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-100 leading-snug">
            {speech}
          </p>
          {/* Cute bubble triangle pointing down */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-slate-800 border-b-2 border-r-2 border-mung-200 dark:border-mung-800 rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* Mascot Character Image */}
      <motion.div
        animate={getAnimation()}
        className="relative w-52 h-52 md:w-60 md:h-60 flex items-center justify-center cursor-pointer group"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
      >
        {/* Soft decorative glow background behind Su-Mung */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-700 pointer-events-none ${
            state === 'FOCUSING'
              ? 'bg-blue-300/40 opacity-90'
              : state === 'INTERRUPTED'
              ? 'bg-rose-400/35 opacity-90'
              : state === 'WAITING'
              ? 'bg-amber-300/30 opacity-80'
              : isCelebrating
              ? 'bg-yellow-300/50 opacity-100'
              : 'bg-mung-200/40 opacity-70'
          }`}
        />

        <img
          src={getAssetSrc()}
          alt="상명대학교 수뭉이"
          className="relative w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300"
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = './assets/sumung/sumung_celebrate.png';
          }}
        />

        {/* State-specific floating badges */}
        {state === 'FOCUSING' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-2 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            감시 중 👀
          </motion.div>
        )}

        {state === 'INTERRUPTED' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 right-0 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1"
          >
            움직임 감지! ⚡
          </motion.div>
        )}

        {state === 'WAITING' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-2 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1"
          >
            대기 {silenceRemainingSeconds}s ⏳
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
