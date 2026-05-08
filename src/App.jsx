import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Grid, OrbitControls, TransformControls } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import * as THREE from 'three'
import { Model } from './PlaneModel'
import { FeaturesSectionDemo } from './ExpandableProjectGrid'
import { AboutCometCard } from './components/AboutCometCard'

const LOCKED_POSITION = [0, -1.21, 0.36]
const LOCKED_SCALE = 2.8
const IDLE_ROTATION = [0, -2.23, 0.02]
const IDLE_RETURN_DELAY_MS = 5000
const SMOOTH_SCROLL_DURATION = 1150

function smoothScrollToSection(sectionId) {
  const target = document.getElementById(sectionId)
  if (!target) return

  const startY = window.scrollY
  const targetY = target.getBoundingClientRect().top + window.scrollY
  const distance = targetY - startY
  const startTime = performance.now()
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2)

  const step = (now) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / SMOOTH_SCROLL_DURATION, 1)
    const eased = easeInOutCubic(progress)
    window.scrollTo(0, startY + distance * eased)
    if (progress < 1) {
      window.requestAnimationFrame(step)
    }
  }

  window.requestAnimationFrame(step)
}

function HeadingTypewriter() {
  const target = 'Kamalesh'
  const [text, setText] = useState('')

  useEffect(() => {
    let i = 0
    const tick = () => {
      i += 1
      setText(target.slice(0, i))
      if (i < target.length) {
        window.setTimeout(tick, 145)
      }
    }
    const startId = window.setTimeout(tick, 260)
    return () => window.clearTimeout(startId)
  }, [])

  return (
    <h1 className="mb-4 font-['Fredoka',_'Poppins',_sans-serif] text-[64px] font-semibold leading-[1.2] tracking-[-0.8px] text-[#FFFFFF] [text-shadow:0_4px_20px_rgba(0,0,0,0.5)] max-xl:text-[60px] max-lg:text-[54px] max-md:text-[44px] max-sm:text-[36px]">
      <span className="inline-flex items-baseline whitespace-nowrap text-[#F5F5F5]/90">
        Hey, I&apos;m&nbsp;
        <span className="bg-gradient-to-r from-[#FFD166] to-[#FACC15] bg-clip-text text-transparent">
          {text}
        </span>
        <span className="typing-cursor ml-1 inline-block">|</span>
      </span>
    </h1>
  )
}

function PlaneInspector({ rotationRef }) {
  const modelRef = useRef(null)
  const transformRef = useRef(null)
  const [boxHelper] = useState(() => new THREE.Box3Helper(new THREE.Box3(), '#00e5ff'))
  const lastInteractionRef = useRef(0)
  const isReturningRef = useRef(false)
  const controls = useControls('Plane Controls', {
    mode: {
      value: 'rotate',
      options: { Move: 'translate', Rotate: 'rotate', Scale: 'scale' },
    },
    positionX: { value: LOCKED_POSITION[0], min: -10, max: 10, step: 0.01 },
    positionY: { value: LOCKED_POSITION[1], min: -10, max: 10, step: 0.01 },
    positionZ: { value: LOCKED_POSITION[2], min: -10, max: 10, step: 0.01 },
    rotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotationY: { value: IDLE_ROTATION[1], min: -Math.PI, max: Math.PI, step: 0.01 },
    rotationZ: { value: IDLE_ROTATION[2], min: -Math.PI, max: Math.PI, step: 0.01 },
    uniformScale: { value: LOCKED_SCALE, min: 0.5, max: 6, step: 0.01 },
  })

  useEffect(() => {
    lastInteractionRef.current = Date.now()
  }, [])

  useFrame(() => {
    if (!modelRef.current) return

    const hideMaterial = (material) => {
      if (!material) return
      material.transparent = true
      material.opacity = 0
      material.depthWrite = false
      material.depthTest = false
      material.colorWrite = false
      material.needsUpdate = true
    }

    const hideObjectMaterials = (object) => {
      if (!object) return
      object.traverse((child) => {
        if (!child.material) return
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach(hideMaterial)
      })
    }

    hideObjectMaterials(transformRef.current)
    hideObjectMaterials(transformRef.current?.controls?.gizmo)
    hideObjectMaterials(transformRef.current?.controls?.helper)

    const currentRotation = modelRef.current.rotation

    if (!isReturningRef.current && Date.now() - lastInteractionRef.current >= IDLE_RETURN_DELAY_MS) {
      isReturningRef.current = true
    }

    if (isReturningRef.current) {
      currentRotation.x = THREE.MathUtils.damp(currentRotation.x, IDLE_ROTATION[0], 6, 1 / 60)
      currentRotation.y = THREE.MathUtils.damp(currentRotation.y, IDLE_ROTATION[1], 6, 1 / 60)
      currentRotation.z = THREE.MathUtils.damp(currentRotation.z, IDLE_ROTATION[2], 6, 1 / 60)

      const closeEnough =
        Math.abs(currentRotation.x - IDLE_ROTATION[0]) < 0.001 &&
        Math.abs(currentRotation.y - IDLE_ROTATION[1]) < 0.001 &&
        Math.abs(currentRotation.z - IDLE_ROTATION[2]) < 0.001

      if (closeEnough) {
        currentRotation.set(IDLE_ROTATION[0], IDLE_ROTATION[1], IDLE_ROTATION[2])
        isReturningRef.current = false
      }
    }

    rotationRef.current = {
      x: currentRotation.x,
      y: currentRotation.y,
      z: currentRotation.z,
    }
  })

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 4]} intensity={2.5} />
      <Environment preset="sunset" />
      <Grid cellSize={0.5} sectionSize={2} fadeDistance={40} fadeStrength={1.6} visible={false} />
      <axesHelper args={[3]} visible={false} />

      <TransformControls
        ref={transformRef}
        mode={controls.mode}
        onMouseDown={() => {
          lastInteractionRef.current = Date.now()
          isReturningRef.current = false
        }}
        onObjectChange={() => {
          lastInteractionRef.current = Date.now()
          isReturningRef.current = false
        }}
      >
        <group
          ref={modelRef}
          position={[controls.positionX, controls.positionY, controls.positionZ]}
          rotation={[controls.rotationX, controls.rotationY, controls.rotationZ]}
          scale={[controls.uniformScale, controls.uniformScale, controls.uniformScale]}
        >
          <Suspense fallback={null}>
            <Model />
          </Suspense>
        </group>
      </TransformControls>

      <primitive object={boxHelper} visible={false} />
      <OrbitControls makeDefault enableZoom={false} />
    </>
  )
}

function App() {
  const heroSectionRef = useRef(null)
  const aboutSectionRef = useRef(null)
  const liveRotationRef = useRef({ x: IDLE_ROTATION[0], y: IDLE_ROTATION[1], z: IDLE_ROTATION[2] })
  const [activeSection, setActiveSection] = useState('home')
  const prefersReducedMotion = useReducedMotion()
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState({ state: 'idle', message: '' }) // idle | sending | success | error
  const [rotationView, setRotationView] = useState({
    x: IDLE_ROTATION[0],
    y: IDLE_ROTATION[1],
    z: IDLE_ROTATION[2],
  })
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, prefersReducedMotion ? 1 : 0.78])

  useEffect(() => {
    const id = window.setInterval(() => {
      setRotationView({ ...liveRotationRef.current })
    }, 50)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const sections = ['home', 'projects']
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id)
        }
      },
      { threshold: [0.35, 0.55, 0.75] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <main>
      <section id="home" ref={heroSectionRef} className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/final-bg.jpeg')" }}
      />

      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0) 100%)',
        }}
      />

      <div className="absolute inset-0 z-20">
        <Canvas camera={{ position: [0, 1.8, 7], fov: 40 }}>
          <PlaneInspector rotationRef={liveRotationRef} />
        </Canvas>
      </div>

      <motion.div
        style={prefersReducedMotion ? undefined : { opacity: heroOpacity }}
        className="relative z-30 max-w-[600px] pl-[120px] pt-[140px] text-left text-white max-lg:pl-14 max-lg:pt-24 max-md:mx-auto max-md:px-6 max-md:pt-16 max-md:text-center [backface-visibility:hidden] [transform:translateZ(0)] [will-change:transform,opacity]"
      >
        <div className="hero-fade-in [animation-delay:0ms] opacity-0">
          <HeadingTypewriter />
        </div>

        <h2 className="hero-fade-in mb-3 font-['Inter',_sans-serif] text-[22px] font-medium text-[#FFFFFF] [text-shadow:0_4px_20px_rgba(0,0,0,0.5)] [animation-delay:200ms] opacity-0 max-md:text-[19px]">
          AI Developer | Web Developer
        </h2>

        <p className="hero-fade-in mb-6 font-['Inter',_sans-serif] text-lg text-[#FFFFFF] [text-shadow:0_4px_20px_rgba(0,0,0,0.5)] [animation-delay:400ms] opacity-0 max-md:text-base">
          Creating AI-powered web apps and interactive systems.
        </p>

        <div className="hero-fade-in mb-4 flex items-center gap-4 [animation-delay:600ms] opacity-0 max-md:flex-col max-md:items-stretch">
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault()
              smoothScrollToSection('projects')
            }}
            className="rounded-xl bg-white px-7 py-3 font-['Inter',_sans-serif] text-base font-semibold text-[#111111] shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-[250ms] ease-in-out hover:translate-y-[-2px] hover:brightness-110"
          >
            View Projects
          </a>
          <button
            type="button"
            className="rounded-xl border border-white/60 bg-transparent px-7 py-3 font-['Inter',_sans-serif] text-base font-semibold text-white backdrop-blur-[6px] transition-all duration-[250ms] ease-in-out hover:translate-y-[-2px] hover:brightness-110"
          >
            Contact Me
          </button>
        </div>

        <div className="hero-fade-in mt-5 flex items-center gap-[14px] opacity-85 [animation-delay:700ms] max-md:justify-center">
          <a
            href="https://github.com/kamalesh-boop"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-white/90 transition hover:scale-105 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58 0-.28-.01-1.03-.02-2.03-3.34.73-4.04-1.6-4.04-1.6-.55-1.37-1.33-1.74-1.33-1.74-1.1-.74.08-.73.08-.73 1.2.08 1.84 1.25 1.84 1.25 1.08 1.84 2.82 1.31 3.5 1 .1-.77.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.9 0-1.3.47-2.35 1.23-3.18-.13-.3-.53-1.5.12-3.14 0 0 1-.32 3.3 1.22a11.5 11.5 0 0 1 6 0c2.3-1.54 3.3-1.22 3.3-1.22.65 1.64.25 2.84.12 3.14.77.83 1.23 1.88 1.23 3.18 0 4.58-2.8 5.6-5.48 5.9.43.37.82 1.1.82 2.2 0 1.6-.02 2.88-.02 3.28 0 .32.22.69.83.57A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/kamaleshehe"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-white/90 transition hover:scale-105 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7 0h3.8v2.2h.1c.53-1 1.82-2.2 3.74-2.2 4 0 4.76 2.64 4.76 6.08V24h-4v-8.1c0-1.93-.03-4.4-2.68-4.4-2.68 0-3.1 2.1-3.1 4.27V24h-4V8z" />
            </svg>
          </a>
        </div>
      </motion.div>

      <div className="absolute right-6 top-6 z-40 flex items-center gap-5 rounded-[999px] border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)] backdrop-blur-[10px] max-md:right-4 max-md:top-4 max-md:gap-3 max-md:px-3">
        <a
          href="#home"
          className={`font-['Inter',_sans-serif] text-sm font-medium text-white transition hover:opacity-80 ${activeSection === 'home' ? 'text-[#FFD166]' : ''}`}
        >
          Home
        </a>
        <a
          href="#projects"
          onClick={(e) => {
            e.preventDefault()
            smoothScrollToSection('projects')
          }}
          className={`font-['Inter',_sans-serif] text-sm font-medium text-white transition hover:opacity-80 ${activeSection === 'projects' ? 'text-[#FFD166]' : ''}`}
        >
          Projects
        </a>
        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault()
            smoothScrollToSection('about')
          }}
          className="font-['Inter',_sans-serif] text-sm font-medium text-white transition hover:opacity-80"
        >
          About
        </a>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault()
            smoothScrollToSection('contact')
          }}
          className="font-['Inter',_sans-serif] text-sm font-medium text-white transition hover:opacity-80"
        >
          Contact
        </a>
      </div>

      <div
        className="absolute right-6 top-6 z-30 rounded-xl border border-white/30 bg-black/45 px-4 py-3 font-['Inter',_sans-serif] text-xs text-white backdrop-blur-sm max-md:right-4 max-md:top-4"
        style={{ display: 'none' }}
      >
        <div className="mb-1 font-semibold">Rotation (radians)</div>
        <div>X: {rotationView.x.toFixed(3)}</div>
        <div>Y: {rotationView.y.toFixed(3)}</div>
        <div>Z: {rotationView.z.toFixed(3)}</div>
        <div className="mt-2 mb-1 font-semibold">Rotation (degrees)</div>
        <div>X: {THREE.MathUtils.radToDeg(rotationView.x).toFixed(1)}°</div>
        <div>Y: {THREE.MathUtils.radToDeg(rotationView.y).toFixed(1)}°</div>
        <div>Z: {THREE.MathUtils.radToDeg(rotationView.z).toFixed(1)}°</div>
      </div>

      <Leva collapsed={false} hidden />
      </section>

      <section
        id="projects"
        className="relative min-h-[100svh] w-full bg-cover bg-center py-16 md:py-18 lg:py-16"
        style={{ backgroundImage: "url('/project-bg.jpeg')" }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75"
          initial={prefersReducedMotion ? false : { opacity: 0.84 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
        <motion.div
          className="relative z-10 px-8 md:px-10 lg:px-14"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          style={prefersReducedMotion ? undefined : { filter: 'blur(6px)' }}
        >
          <motion.h2
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="mx-auto max-w-[90rem] text-left font-['Fredoka',_'Poppins',_sans-serif] text-[2.1rem] font-semibold leading-tight text-white max-md:text-[1.85rem] [will-change:transform,opacity]"
          >
            Projects
          </motion.h2>
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.12 }}
            className="mx-auto mt-1.5 max-w-[90rem] text-left font-['Inter',_sans-serif] text-[14px] text-white/80 [will-change:transform,opacity]"
          >
            A few things I&apos;ve built.
          </motion.p>
          <FeaturesSectionDemo />
        </motion.div>
      </section>

      <section
        id="about"
        ref={aboutSectionRef}
        className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/aboutt-bg.jpeg')",
          backgroundSize: 'cover',
        }}
      >
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          drag
          dragConstraints={aboutSectionRef}
          dragElastic={0.16}
          dragMomentum
          dragTransition={{
            power: 0.18,
            timeConstant: 260,
            modifyTarget: (target) => Math.round(target * 100) / 100,
            bounceStiffness: 360,
            bounceDamping: 24,
            restSpeed: 0.25,
            restDelta: 0.35,
          }}
          whileDrag={{ scale: 1.012 }}
          className="absolute left-[6%] top-1/2 z-10 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <AboutCometCard />
        </motion.div>
      </section>

      <section
        id="contact"
        className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/footer-bg.jpeg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/65 to-black/80" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-[90rem] flex-col justify-between px-8 py-20 md:px-10 lg:px-14">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="grid gap-12 lg:grid-cols-[1.2fr_1fr]"
          >
            <div>
              <h2 className="font-['Fredoka',_'Poppins',_sans-serif] text-[2.4rem] font-semibold text-white max-md:text-[2rem]">
                Contact Me
              </h2>
              <p className="mt-4 max-w-[38rem] font-['Inter',_sans-serif] text-[1.05rem] leading-relaxed text-white/85">
                Got a project idea, collaboration, or opportunity? Let&apos;s build something memorable together. I&apos;m
                always open to discussing AI products, immersive web experiences, and modern full-stack builds.
              </p>

              <div className="mt-8 space-y-4 font-['Inter',_sans-serif] text-white/90">
                <p>
                  <span className="font-semibold text-[#FFD166]">Email:</span>{' '}
                  <a href="mailto:kamal2005esh@gmail.com" className="transition hover:text-white">
                    kamal2005esh@gmail.com
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-[#FFD166]">Location:</span> Coimbatore, India
                </p>
                <p>
                  <span className="font-semibold text-[#FFD166]">Availability:</span> Open to freelance and full-time
                  roles
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <h3 className="font-['Poppins',_sans-serif] text-xl font-semibold text-white">Quick Message</h3>
              <form
                className="mt-5 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (contactStatus.state === 'sending') return

                  setContactStatus({ state: 'sending', message: '' })
                  try {
                    const payload = {
                      access_key: '7d572ecf-0cf0-4f05-bb2d-61c22564ce76',
                      name: contactForm.name,
                      email: contactForm.email,
                      message: contactForm.message,
                      subject: `Portfolio message from ${contactForm.name || 'Someone'}`,
                    }

                    const res = await fetch('https://api.web3forms.com/submit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    })
                    const data = await res.json().catch(() => null)

                    if (!res.ok || !data?.success) {
                      throw new Error(data?.message || 'Message failed to send.')
                    }

                    setContactStatus({ state: 'success', message: 'Message sent. I’ll get back to you soon.' })
                    setContactForm({ name: '', email: '', message: '' })
                  } catch (err) {
                    setContactStatus({
                      state: 'error',
                      message: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
                    })
                  }
                }}
              >
                <input
                  type="text"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((v) => ({ ...v, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/20 bg-black/25 px-4 py-3 font-['Inter',_sans-serif] text-white placeholder:text-white/65 outline-none transition focus:border-[#FFD166]/70"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((v) => ({ ...v, email: e.target.value }))}
                  className="w-full rounded-xl border border-white/20 bg-black/25 px-4 py-3 font-['Inter',_sans-serif] text-white placeholder:text-white/65 outline-none transition focus:border-[#FFD166]/70"
                />
                <textarea
                  rows={4}
                  placeholder="Your message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm((v) => ({ ...v, message: e.target.value }))}
                  className="w-full rounded-xl border border-white/20 bg-black/25 px-4 py-3 font-['Inter',_sans-serif] text-white placeholder:text-white/65 outline-none transition focus:border-[#FFD166]/70"
                />
                {contactStatus.state !== 'idle' && contactStatus.message ? (
                  <div
                    className={`rounded-xl border px-4 py-3 font-['Inter',_sans-serif] text-sm ${
                      contactStatus.state === 'success'
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                        : contactStatus.state === 'error'
                          ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                          : 'border-white/15 bg-white/10 text-white/85'
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    {contactStatus.message}
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={contactStatus.state === 'sending'}
                  className="w-full rounded-xl bg-[#FFD166] px-5 py-3 font-['Inter',_sans-serif] font-semibold text-[#1b1b1b] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {contactStatus.state === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </motion.div>

          <footer className="mt-16 border-t border-white/15 pt-6">
            <div className="flex flex-col items-start justify-between gap-3 font-['Inter',_sans-serif] text-sm text-white/75 md:flex-row md:items-center">
              <p>© {new Date().getFullYear()} Kamalesh. Crafted with React, Three.js, and cinematic vibes.</p>
              <div className="flex items-center gap-5">
                <a
                  href="https://github.com/kamalesh-boop"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/kamaleshehe"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  LinkedIn
                </a>
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault()
                    smoothScrollToSection('home')
                  }}
                  className="transition hover:text-white"
                >
                  Back to top
                </a>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default App
