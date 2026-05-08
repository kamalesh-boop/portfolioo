import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { IconBrandGithub, IconBrandWhatsapp, IconBrowser, IconRobot, IconScale, IconSparkles, IconTerminal2 } from '@tabler/icons-react'
import { useOutsideClick } from './hooks/useOutsideClick'

const cn = (...classes) => classes.filter(Boolean).join(' ')

const LAYOUT_SPRING = {
  type: 'spring',
  stiffness: 520,
  damping: 46,
  mass: 0.9,
}

function CloseIcon() {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black dark:text-white"
      aria-hidden
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  )
}

const PROJECT_CARDS = [
  {
    title: 'JARVIS — Local AI Assistant',
    description: 'A fully offline voice-controlled AI agent that can search the web, control your system, and remember you.',
    icon: <IconRobot />,
    ctaText: 'View Details',
    ctaLink: '#projects',
    content: () => (
      <p>
        Built a local JARVIS-style AI assistant from scratch on a budget laptop (8GB RAM, no GPU). Uses Ollama + LLaMA
        3.2 for the brain, Whisper for voice recognition, and Piper TTS for speech output — all running fully offline.
        <br />
        <br />
        The agent can browse the web, execute shell commands, open applications, read and write files, and retain
        long-term memory across sessions using ChromaDB.
        <br />
        <br />
        No API keys, no cloud, no cost.
        <br />
        <br />
        <span className="font-semibold text-white">Tech stack:</span>{' '}
        <span className="text-white/90">
          Python · Ollama · LLaMA 3.2 · Whisper · ChromaDB · Piper TTS · DuckDuckGo Search · Ubuntu
        </span>
      </p>
    ),
  },
  {
    title: 'LexAI — Offline Legal RAG Assistant',
    description: 'An offline AI legal assistant using a hybrid RAG pipeline for grounded legal search and explanations.',
    icon: <IconScale />,
    ctaText: 'View Details',
    ctaLink: '#projects',
    content: () => (
      <p>
        Built an offline legal AI assistant using a production-style Retrieval-Augmented Generation (RAG) architecture.
        <br />
        <br />
        The system analyzes and reformulates legal questions into proper legal terminology, performs high-recall
        semantic retrieval across Indian legal corpora, re-ranks results using a cross-encoder, and generates grounded
        legal explanations using a local LLM running fully on-device.
        <br />
        <br />
        Designed with a FastAPI backend and a premium React/Vite frontend, the platform supports semantic legal search,
        citation-aware responses, and explainable AI workflows without relying on cloud APIs.
        <br />
        <br />
        <span className="font-semibold text-white">Tech stack:</span>{' '}
        <span className="text-white/90">
          Python · FastAPI · React · Vite · FAISS · SentenceTransformers · Cross-Encoder Re-ranking · Ollama · DeepSeek
          · Mistral · Streamlit · RAG Pipeline
        </span>
      </p>
    ),
  },
  {
    title: 'Nova — Personal AI Life Coach',
    description: 'A full-stack AI productivity coach that manages tasks, habits, mood, and study sessions in one intelligent workspace.',
    icon: <IconSparkles />,
    ctaText: 'View Details',
    ctaLink: '#projects',
    content: () => (
      <p>
        Built and deployed a production-grade AI life coach web app using Next.js 14 and Supabase.
        <br />
        <br />
        Nova tracks tasks, mood scores, habit streaks, hydration, and study progress, then injects that context into
        every AI conversation to create personalized responses.
        <br />
        <br />
        Features include streaming AI chat, habit tracking, mood analytics, Pomodoro-style study sessions, Web Push
        reminders, and installable PWA support for desktop and mobile.
        <br />
        <br />
        <span className="font-semibold text-white">Tech stack:</span>{' '}
        <span className="text-white/90">
          TypeScript · Next.js 14 · React · Supabase · Prisma · PostgreSQL · Groq API · Tailwind CSS · shadcn/ui ·
          Vercel · PWA
        </span>
      </p>
    ),
  },
  {
    title: 'Aria — Smart Research Assistant',
    description: 'An AI-powered Chrome extension that summarizes webpages and lets users ask questions on highlighted text.',
    icon: <IconBrowser />,
    ctaText: 'View Details',
    ctaLink: '#projects',
    content: () => (
      <p>
        Built a production-grade Chrome extension using Plasmo and React that transforms webpages into interactive
        research sessions.
        <br />
        <br />
        Aria injects a floating tooltip on text selection, allowing users to ask AI questions about highlighted content
        in real time.
        <br />
        <br />
        Features include instant summarization, persistent research boards, streamed AI responses, and one-click export
        to PDF or Markdown — all running client-side with no backend.
        <br />
        <br />
        <span className="font-semibold text-white">Tech stack:</span>{' '}
        <span className="text-white/90">
          TypeScript · React · Plasmo · Chrome Extension MV3 · Groq API · jsPDF · Tailwind CSS · IndexedDB
        </span>
      </p>
    ),
  },
  {
    title: 'terminalbuddy — AI Terminal Assistant',
    description: 'A cross-platform AI CLI tool that translates plain English into executable shell commands.',
    icon: <IconTerminal2 />,
    ctaText: 'View Details',
    ctaLink: '#projects',
    content: () => (
      <p>
        Built an AI-powered terminal assistant in Python that converts natural language into executable shell commands.
        <br />
        <br />
        Features include AI-based failed-command fixing, shell detection for PowerShell/bash/zsh, clipboard copy,
        command history with SQLite, and support for both cloud and local LLM backends.
        <br />
        <br />
        Designed with safety-first protections where dangerous commands always require confirmation.
        <br />
        <br />
        <span className="font-semibold text-white">Tech stack:</span>{' '}
        <span className="text-white/90">
          Python · Typer · Rich · Groq API · Ollama · SQLite · shellingham · pyperclip · pipx
        </span>
      </p>
    ),
  },
  {
    title: 'WhatsApp Doc Scanner Bot',
    description: 'A WhatsApp bot that converts photos into clean scanner-style PDFs directly inside chat.',
    icon: <IconBrandWhatsapp />,
    ctaText: 'View Details',
    ctaLink: '#projects',
    content: () => (
      <p>
        Built a WhatsApp bot that transforms photos into scanner-quality PDFs in seconds.
        <br />
        <br />
        The backend uses OpenCV image processing with grayscale conversion, contrast enhancement, and sharpening filters
        to improve readability before generating PDFs automatically.
        <br />
        <br />
        Deployed on Railway using the Meta WhatsApp Cloud API for message handling.
        <br />
        <br />
        <span className="font-semibold text-white">Tech stack:</span>{' '}
        <span className="text-white/90">
          Python · Flask · OpenCV · img2pdf · Meta WhatsApp Cloud API · Railway · Gunicorn
        </span>
      </p>
    ),
  },
]

function ProjectFeatureCell({
  feature,
  index,
  layoutKey,
  onOpen,
  isExpanded,
  isInteractionLocked,
  prefersReducedMotion,
}) {
  const { title, description, icon } = feature
  const colIndex = index % 3
  const isFirstColumn = colIndex === 0
  const isLastColumn = colIndex === 2
  const isFirstRow = index < 3
  const rowIndex = Math.floor(index / 3)
  const revealDelay = rowIndex * 0.14 + colIndex * 0.08

  const open = useCallback(() => {
    if (isInteractionLocked) return
    onOpen(feature)
  }, [feature, isInteractionLocked, onOpen])

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        open()
      }
    },
    [open],
  )

  return (
    <motion.div
      layoutId={`card-${title}-${layoutKey}`}
      transition={LAYOUT_SPRING}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30, filter: 'blur(8px)' }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.25 }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      transition={
        prefersReducedMotion
          ? undefined
          : {
              opacity: { duration: 0.68, ease: 'easeOut', delay: revealDelay },
              y: { duration: 0.68, ease: 'easeOut', delay: revealDelay },
              filter: { duration: 0.65, ease: 'easeOut', delay: revealDelay },
              layout: LAYOUT_SPRING,
            }
      }
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-disabled={isInteractionLocked}
      aria-label={`Open details: ${title}`}
      onClick={open}
      onKeyDown={onKeyDown}
      className={cn(
        'group/feature relative flex cursor-pointer flex-col py-12 transition-all duration-300 [backface-visibility:hidden] [transform:translateZ(0)] [will-change:transform,opacity] outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]/80 border-white/15 hover:border-[#FFD166]/45 hover:shadow-[0_14px_35px_rgba(0,0,0,0.2)]',
        isExpanded && 'pointer-events-none',
        isFirstColumn && 'border-l',
        isLastColumn && 'border-r',
        isFirstRow && 'border-b',
      )}
    >
      {index < 4 && (
        <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-t from-white/12 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100" />
      )}
      {index >= 4 && (
        <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-b from-white/12 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100" />
      )}

      <div className="relative z-10 mb-4 px-12">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/90 backdrop-blur-[10px] [&_svg]:h-6 [&_svg]:w-6">
          {icon}
        </div>
      </div>

      <div className="relative z-10 mb-2 px-12 text-xl font-bold text-[rgba(255,255,255,0.96)]">
        <div className="absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-br-full rounded-tr-full bg-white/30 transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-[#FACC15]" />
        <motion.h3
          layoutId={`title-${title}-${layoutKey}`}
          transition={LAYOUT_SPRING}
          className="inline-block transition duration-200 group-hover/feature:translate-x-2"
        >
          {title}
        </motion.h3>
      </div>

      <motion.p
        layoutId={`description-${title}-${layoutKey}`}
        transition={LAYOUT_SPRING}
        className="relative z-10 max-w-[280px] px-12 text-left text-[15px] leading-relaxed text-[rgba(255,255,255,0.72)]"
      >
        {description}
      </motion.p>
    </motion.div>
  )
}

export function FeaturesSectionDemo() {
  const [selectedCard, setSelectedCard] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [phase, setPhase] = useState('idle')
  const layoutKey = useId()
  const modalRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const isInteractionLocked = phase !== 'idle'

  const open = useCallback(
    (card) => {
      if (phase === 'closing') return
      setSelectedCard(card)
      setIsModalOpen(true)
      setPhase('open')
    },
    [phase],
  )

  const close = useCallback(() => {
    if (!isModalOpen) return
    setPhase('closing')
    setIsModalOpen(false)
  }, [isModalOpen])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        close()
      }
    }

    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close, isModalOpen])

  useOutsideClick(modalRef, close)

  return (
    <LayoutGroup id={`projects-layout-${layoutKey}`}>
      <AnimatePresence
        initial={false}
        mode="wait"
        onExitComplete={() => {
          setPhase('idle')
          setSelectedCard(null)
        }}
      >
        {isModalOpen && selectedCard ? (
          <motion.div
            key={`modal-layer-${selectedCard.title}`}
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] h-full w-full bg-black/40"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                close()
              }}
              aria-hidden
            />
            <div className="fixed inset-0 z-[100] grid place-items-center p-4">
              <motion.button
                type="button"
                key={`close-${selectedCard.title}-${layoutKey}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-neutral-800 lg:hidden"
                onClick={close}
                aria-label="Close project details"
              >
                <CloseIcon />
              </motion.button>

              <motion.div
                layoutId={`card-${selectedCard.title}-${layoutKey}`}
                ref={modalRef}
                transition={LAYOUT_SPRING}
                initial={false}
                className="flex h-full max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden border border-white/10 bg-[linear-gradient(135deg,rgba(17,24,39,0.88),rgba(15,23,42,0.78))] shadow-[0_25px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[18px] sm:max-h-[90%] sm:rounded-3xl md:h-fit"
              >
                <div className="min-h-0 flex-1 overflow-hidden">
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <motion.h3
                        layoutId={`title-${selectedCard.title}-${layoutKey}`}
                        transition={LAYOUT_SPRING}
                        className="text-base font-medium text-neutral-700 dark:text-neutral-200"
                      >
                        {selectedCard.title}
                      </motion.h3>
                      <motion.p
                        layoutId={`description-${selectedCard.title}-${layoutKey}`}
                        transition={LAYOUT_SPRING}
                        className="text-base text-neutral-600 dark:text-neutral-400"
                      >
                        {selectedCard.description}
                      </motion.p>
                    </div>

                    <motion.a
                      layout
                      href={selectedCard.ctaLink}
                      {...(/^https?:\/\//i.test(selectedCard.ctaLink)
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-[10px] transition-all duration-250 ease-in-out hover:-translate-y-0.5 hover:scale-105 hover:border-[#FACC15]/45 hover:bg-white/15"
                      aria-label="Open project on GitHub"
                    >
                      <IconBrandGithub className="h-5 w-5" />
                    </motion.a>
                  </div>

                  <div className="relative px-4 pt-2">
                    <motion.div
                      layout
                      className="flex max-h-[40vh] flex-col items-start gap-4 overflow-auto pb-10 text-xs text-neutral-600 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] md:max-h-none md:text-sm lg:text-base dark:text-neutral-400 [&::-webkit-scrollbar]:hidden"
                    >
                      {typeof selectedCard.content === 'function'
                        ? selectedCard.content()
                        : selectedCard.content}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          'mx-auto grid max-w-[84rem] grid-cols-1 gap-x-6 gap-y-14 py-12 md:grid-cols-2 lg:grid-cols-3',
          isInteractionLocked && 'pointer-events-none',
        )}
        aria-hidden={isModalOpen ? true : undefined}
      >
        {PROJECT_CARDS.map((feature, index) => (
          <ProjectFeatureCell
            key={feature.title}
            feature={feature}
            index={index}
            layoutKey={layoutKey}
            onOpen={open}
            isExpanded={selectedCard?.title === feature.title && phase !== 'idle'}
            isInteractionLocked={isInteractionLocked}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </LayoutGroup>
  )
}
