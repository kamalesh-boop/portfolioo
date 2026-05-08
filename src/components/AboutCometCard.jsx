import { CometCard } from './ui/comet-card'
import { IconBrain, IconCode, IconRocket } from '@tabler/icons-react'

export function AboutCometCard() {
  return (
    <CometCard>
      <button
        type="button"
        aria-label="About Me card"
        className="group relative my-10 flex w-[min(620px,92vw)] cursor-pointer flex-col items-stretch overflow-hidden rounded-[30px] border border-white/35 bg-white/12 p-6 shadow-[0_24px_90px_rgba(37,99,235,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-3xl transition-all duration-500 hover:scale-[1.012] md:my-20 md:p-7"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#7dd3fc]/28 via-[#c084fc]/16 to-[#60a5fa]/26 opacity-90" />
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#60a5fa]/24 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#c084fc]/16 blur-3xl" />

        <div className="relative z-10">
          <div className="mt-1">
            <h1
              className="text-[78px] leading-[0.9] tracking-[-4px] text-white max-md:text-[62px]"
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                WebkitTextStroke: '3px #2563eb',
                textShadow: '0px 5px 0px #1d4ed8, 0px 14px 30px rgba(37,99,235,0.25)',
              }}
            >
              About
              <span
                className="ml-3 text-[#ffd54f]"
                style={{
                  WebkitTextStroke: '3px #f59e0b',
                  textShadow: '0px 5px 0px #ea580c, 0px 14px 30px rgba(245,158,11,0.25)',
                }}
              >
                Me
              </span>
            </h1>
            <div className="mt-3 h-[6px] w-[160px] rounded-full bg-[#4f46e5]" />
          </div>

          <div className="mt-6 space-y-4">
            <h2
              className="text-[34px] font-bold leading-tight text-slate-900 max-md:text-[28px]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Hey guys, I&apos;m <span className="text-[#5b5bf7]">Kamalesh</span>
            </h2>

            <p className="text-[22px] font-medium leading-[1.8] text-slate-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
              I build things because the idea sounded <span className="font-bold text-[#5b5bf7]">too cool to ignore.</span>
            </p>

            <p className="text-[22px] font-medium leading-[1.8] text-slate-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Most of my work revolves around <span className="font-bold text-[#5b5bf7]">AI systems</span>, immersive web
              experiences, and interactive tools.
            </p>

            <p className="text-[22px] font-medium leading-[1.8] text-slate-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
              I love combining <span className="font-bold text-[#5b5bf7]">cinematic visuals</span>, smooth interactions, and
              futuristic interfaces.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {[
              { label: 'AI/ML', icon: IconBrain },
              { label: 'React', icon: IconCode },
              { label: 'FastAPI', icon: IconRocket },
              { label: 'Cinematic UI', icon: IconBrain },
              { label: 'Interactive Web', icon: IconCode },
            ].map(({ label, icon: TagIcon }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white/60 px-4 py-2 text-sm font-semibold text-[#2563eb] shadow-sm backdrop-blur-md"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <TagIcon className="h-4 w-4" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </button>
    </CometCard>
  )
}
