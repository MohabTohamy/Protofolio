'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Briefcase, FolderGit2 } from 'lucide-react';

// Taunt messages based on escape count (constant array)
const tauntMessages = [
    "Missed 😏",
    "Too slow developer",
    "Are you debugging me?",
    "Bro just press YES",
    "Okay this is getting awkward"
];

export default function FunnySurvey() {
    // Modal states
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFakeProcessing, setShowFakeProcessing] = useState(false);

    // Escape mechanic states
    const [escapeCount, setEscapeCount] = useState(0);
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
    const [tauntMessage, setTauntMessage] = useState('');
    const [showExtraButton, setShowExtraButton] = useState(false);
    const [extraButtonTransformed, setExtraButtonTransformed] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);

    // Mouse tracking
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const escapingButtonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const lastEscapeTimeRef = useRef(0);
    const animationFrameRef = useRef<number | undefined>(undefined);

    // Reset all states when opening the survey
    const openSurvey = () => {
        setIsOpen(true);
        setShowConfirmation(false);
        setShowSuccess(false);
        setShowFakeProcessing(false);
        setEscapeCount(0);
        setShowExtraButton(false);
        setExtraButtonTransformed(false);
        setTauntMessage('');
    };

    // Handle the "No" button click in main survey
    const handleNoClick = () => {
        setShowConfirmation(true);
    };

    // Handle the "Yes" button click in main survey
    const handleYesClick = () => {
        setShowSuccess(true);
    };

    // Initialize button position to center when confirmation screen opens
    useEffect(() => {
        if (!showConfirmation || !escapingButtonRef.current) return;

        // Only set center position on mount of confirmation screen
        const button = escapingButtonRef.current;
        const buttonRect = button.getBoundingClientRect();

        // Calculate center position of viewport
        const centerX = (window.innerWidth / 2) - (buttonRect.width / 2);
        const centerY = (window.innerHeight / 2) - (buttonRect.height / 2);

        // Set initial centered position
        setButtonPosition({ x: centerX, y: centerY });
    }, [showConfirmation]); // Only run when confirmation screen opens

    // Track mouse position for escape mechanic
    useEffect(() => {
        if (!showConfirmation) return;

        const checkAndEscape = () => {
            if (!escapingButtonRef.current) return;

            const button = escapingButtonRef.current;
            const buttonRect = button.getBoundingClientRect();

            // Calculate button center
            const buttonCenterX = buttonRect.left + buttonRect.width / 2;
            const buttonCenterY = buttonRect.top + buttonRect.height / 2;

            // Calculate distance from mouse to button center
            const distance = Math.sqrt(
                Math.pow(mousePos.x - buttonCenterX, 2) +
                Math.pow(mousePos.y - buttonCenterY, 2)
            );

            // Fixed escape threshold - button escapes when mouse gets within 120px
            const escapeThreshold = 120;

            // Throttle escapes to max once per 100ms to prevent cascading renders
            const now = Date.now();
            const timeSinceLastEscape = now - lastEscapeTimeRef.current;

            if (distance < escapeThreshold && timeSinceLastEscape > 100) {
                lastEscapeTimeRef.current = now;

                // Calculate escape direction (away from mouse)
                const angle = Math.atan2(
                    buttonCenterY - mousePos.y,
                    buttonCenterX - mousePos.x
                );

                // Calculate new position with increased speed per escape (but capped)
                const moveDistance = 150 + Math.min(escapeCount * 15, 200);

                // Calculate potential new position
                let newX = buttonRect.left + Math.cos(angle) * moveDistance;
                let newY = buttonRect.top + Math.sin(angle) * moveDistance;

                // Boundary clamping - keep button fully visible on screen
                // Add padding to prevent button from touching edges
                const padding = 20;
                const buttonWidth = buttonRect.width;
                const buttonHeight = buttonRect.height;
                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;

                // Calculate maximum allowed positions
                const maxX = containerWidth - buttonWidth - padding;
                const maxY = containerHeight - buttonHeight - padding;

                // Clamp coordinates to stay within bounds
                newX = Math.max(padding, Math.min(newX, maxX));
                newY = Math.max(padding, Math.min(newY, maxY));

                // Prevent same position - add randomness if too close to current position
                const positionDiff = Math.sqrt(
                    Math.pow(newX - buttonRect.left, 2) +
                    Math.pow(newY - buttonRect.top, 2)
                );

                if (positionDiff < 50) {
                    // Add random offset but stay within bounds
                    newX += (Math.random() - 0.5) * 100;
                    newY += (Math.random() - 0.5) * 100;
                    // Re-clamp after adding randomness
                    newX = Math.max(padding, Math.min(newX, maxX));
                    newY = Math.max(padding, Math.min(newY, maxY));
                }

                // Update position
                setButtonPosition({ x: newX, y: newY });

                // Increment escape count
                setEscapeCount(prev => {
                    const newCount = prev + 1;

                    // Show taunt message occasionally
                    if (newCount % 3 === 0 && newCount <= 15) {
                        const messageIndex = Math.min(Math.floor(newCount / 3) - 1, tauntMessages.length - 1);
                        setTauntMessage(tauntMessages[messageIndex]);
                        setTimeout(() => setTauntMessage(''), 2000);
                    }

                    // Show extra button after 5 escapes
                    if (newCount === 5) {
                        setShowExtraButton(true);
                    }

                    return newCount;
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });

            // Use requestAnimationFrame for smooth checking
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(checkAndEscape);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [showConfirmation, escapeCount, mousePos.x, mousePos.y]);
    // Dependencies: showConfirmation to start/stop, escapeCount for speed calculation, mousePos for checks

    // Handle extra button click - transforms after 5 seconds
    const handleExtraButtonClick = () => {
        setTimeout(() => {
            setExtraButtonTransformed(true);
        }, 5000);
    };

    // Handle "back to survey" - returns to main question
    const handleBackToSurvey = () => {
        setShowConfirmation(false);
        setEscapeCount(0);
        setShowExtraButton(false);
        setExtraButtonTransformed(false);
        setTauntMessage('');
    };

    // Fake processing animation
    const startFakeProcessing = () => {
        setShowFakeProcessing(true);
        setProcessingProgress(0);

        // Animate progress bar
        const interval = setInterval(() => {
            setProcessingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Show rejection message after progress completes
                    setTimeout(() => {
                        setShowFakeProcessing(false);
                        setShowConfirmation(false);
                        setEscapeCount(0);
                        setShowExtraButton(false);
                        setExtraButtonTransformed(false);
                    }, 1500);
                    return 100;
                }
                // Progress: 0 -> 20 -> 60 -> 100
                if (prev === 0) return 20;
                if (prev === 20) return 60;
                if (prev === 60) return 100;
                return prev + 1;
            });
        }, 600);
    };

    // Close modal
    const closeModal = () => {
        setIsOpen(false);
        setShowConfirmation(false);
        setShowSuccess(false);
        setShowFakeProcessing(false);
    };

    return (
        <>
            {/* Trigger Button */}
            <div className="flex flex-col items-center gap-2 my-12">
                <motion.button
                    onClick={openSurvey}
                    className="px-8 py-4 text-xl font-bold text-white bg-black hover:bg-gray-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Press here if you dare
                </motion.button>
                <p className="text-sm text-foreground/60">Developer curiosity test</p>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && !showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            ref={modalRef}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
                        >
                            {/* Close button */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-black/60 hover:text-black transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Main Survey */}
                            {!showSuccess && !showFakeProcessing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center"
                                >
                                    <h2 className="text-3xl font-bold text-black mb-6">
                                        Quick survey for developers
                                    </h2>
                                    <p className="text-xl text-black/80 mb-8">
                                        Should I hire Mohab?
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <motion.button
                                            onClick={handleYesClick}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            Yes, sure he is the best
                                        </motion.button>
                                        <motion.button
                                            onClick={handleNoClick}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            No, try no if you dare 😠
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Fake Processing */}
                            {showFakeProcessing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8"
                                >
                                    <h2 className="text-2xl font-bold text-black mb-6">
                                        Processing your decision...
                                    </h2>
                                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${processingProgress}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full bg-gray-800"
                                        />
                                    </div>
                                    <p className="text-xl text-black/80">{processingProgress}%</p>

                                    {processingProgress === 100 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6"
                                        >
                                            <p className="text-2xl font-bold text-red-500 mb-2">
                                                Decision rejected.
                                            </p>
                                            <p className="text-black/70">
                                                Please press YES.
                                            </p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {/* Success Screen */}
                            {showSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-4"
                                >
                                    <div className="text-6xl mb-4">😎</div>
                                    <h2 className="text-3xl font-bold text-black mb-2">
                                        Correct answer
                                    </h2>
                                    <p className="text-lg text-black/70 mb-8">
                                        You passed the developer test.
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        <motion.a
                                            href="/contact"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Briefcase className="w-5 h-5" />
                                            Hire Mohab
                                        </motion.a>

                                        <motion.a
                                            href="/projects"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <FolderGit2 className="w-5 h-5" />
                                            View Projects
                                        </motion.a>

                                        <motion.a
                                            href="/cv.pdf"
                                            download
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download CV
                                        </motion.a>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal (Escape Mechanic) - Fullscreen transparent - SEPARATE from modal */}
            <AnimatePresence>
                {isOpen && showConfirmation && !showFakeProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-60 bg-white/30 backdrop-blur-sm"
                    >
                        {/* Close button - Top right */}
                        <button
                            onClick={closeModal}
                            className="fixed top-4 right-4 text-black hover:text-black/80 transition-colors z-50 bg-white/80 p-2 rounded-lg shadow-lg"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Taunt Message - Fixed position */}
                        <AnimatePresence>
                            {tauntMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="fixed top-20 left-1/2 -translate-x-1/2 text-2xl font-bold text-black bg-white/90 px-6 py-3 rounded-xl shadow-xl z-50"
                                >
                                    {tauntMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Escape Count Display - Fixed position */}
                        {escapeCount > 0 && (
                            <p className="fixed top-4 left-1/2 -translate-x-1/2 text-black/60 text-lg bg-white/80 px-4 py-2 rounded-lg shadow-lg">
                                Escape attempts: {escapeCount}
                            </p>
                        )}

                        {/* Escaping Button - Moves across entire screen */}
                        <motion.button
                            ref={escapingButtonRef}
                            animate={{
                                left: buttonPosition.x,
                                top: buttonPosition.y,
                            }}
                            transition={{
                                type: "tween",
                                duration: 0.05,
                                ease: "linear"
                            }}
                            className="fixed px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl shadow-2xl cursor-pointer z-40"
                            style={{ userSelect: 'none' }}
                        >
                            Yes I am sure
                        </motion.button>

                        {/* Static Back Button - Fixed bottom center */}
                        <motion.button
                            onClick={handleBackToSurvey}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl shadow-2xl transition-all z-40"
                        >
                            No I&apos;m not sure take me back
                        </motion.button>

                        {/* Extra Button After 5 Escapes - Fixed position */}
                        {showExtraButton && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
                            >
                                {!extraButtonTransformed ? (
                                    <motion.button
                                        onClick={handleExtraButtonClick}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl shadow-2xl transition-all"
                                    >
                                        Can&apos;t you just press YES?
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        onClick={handleBackToSurvey}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl shadow-2xl transition-all"
                                    >
                                        No I&apos;m not sure take me back
                                    </motion.button>
                                )}
                            </motion.div>
                        )}

                        {/* Hidden trigger for fake processing */}
                        {escapeCount > 10 && (
                            <button
                                onClick={startFakeProcessing}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 text-xs text-black/60 mt-4 underline bg-white/80 px-3 py-1 rounded z-40"
                            >
                                I give up
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
