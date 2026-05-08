import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export function CometCard({ children }) {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)

  const smoothRotateX = useSpring(rotateX, { stiffness: 160, damping: 18, mass: 0.65 })
  const smoothRotateY = useSpring(rotateY, { stiffness: 160, damping: 18, mass: 0.65 })
  const smoothGlowX = useSpring(glowX, { stiffness: 120, damping: 24 })
  const smoothGlowY = useSpring(glowY, { stiffness: 120, damping: 24 })
  const glowBackground = useTransform(
    [smoothGlowX, smoothGlowY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(125,211,252,0.34), rgba(96,165,250,0.10) 42%, transparent 72%)`,
  )

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height

    const tiltY = (px - 0.5) * 18
    const tiltX = (0.5 - py) * 18

    rotateX.set(tiltX)
    rotateY.set(tiltY)
    glowX.set(px * 100)
    glowY.set(py * 100)
  }

  const handlePointerLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    glowX.set(50)
    glowY.set(50)
  }

  return (
    <div className="relative [perspective:1200px]">
      <div
        className="pointer-events-none absolute -inset-[1px] rounded-[42px] opacity-70 blur-xl"
        style={{ background: glowBackground }}
        aria-hidden
      />
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX: smoothRotateX,
          rotateY: smoothRotateY,
          transformPerspective: 1200,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
