import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAPOD } from '../hooks/useAPOD'
import { Loader, ErrorMessage } from '../components/UI/Status'

export default function APOD() {
  const { data, isLoading, error } = useAPOD()
  const [imgLoaded, setImgLoaded]  = useState(false)

  if (isLoading) return <Loader label="Aligning telescope" />
  if (error)     return <div className="p-8"><ErrorMessage message={error.message} /></div>

  const credit = data.copyright?.trim() || 'NASA / Public domain'

  return (
    <main className="min-h-[calc(100vh-61px)] grid lg:grid-cols-[1fr_400px]">

      {/* ── Left: image / video ── */}
      <div className="relative bg-void flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-0">

        {data.media_type === 'image' ? (
          <>
            {/* Blur placeholder while loading */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-panel animate-pulse" />
            )}
            <motion.img
              src={data.url}
              alt={data.title}
              onLoad={() => setImgLoaded(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: imgLoaded ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full object-contain lg:object-cover max-h-[90vh]"
            />
          </>
        ) : (
          <iframe
            src={data.url}
            title={data.title}
            className="w-full aspect-video"
            allowFullScreen
          />
        )}

        {/* HD link — overlaid bottom-left on the image */}
        {data.hdurl && (
          <a
            href={data.hdurl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-4 left-4 telemetry text-dim border border-hairline rounded-full px-3 py-1.5 bg-void/70 backdrop-blur hover:text-body hover:border-glow/40 transition-colors"
          >
            View HD
          </a>
        )}
      </div>

      {/* ── Right: info panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col border-l border-hairline overflow-y-auto"
      >
        <div className="flex-1 p-7 lg:p-9">

          {/* Date + credit — sparse, at the top */}
          <div className="flex items-center justify-between mb-8">
            <p className="font-mono text-xs text-dim">{data.date}</p>
            <p className="font-mono text-xs text-dim truncate ml-4 max-w-[160px]" title={credit}>
              {credit}
            </p>
          </div>

          {/* Title */}
          <h1 className="font-display font-semibold leading-tight mb-6"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
            {data.title}
          </h1>

          {/* Explanation -- readable prose, no box */}
          <p className="text-soft text-sm leading-7">
            {data.explanation}
          </p>
        </div>

        {/* Footer strip */}
        <div className="border-t border-hairline px-7 lg:px-9 py-4 flex items-center justify-between gap-4">
          <span className="telemetry text-dim">
            {data.media_type === 'video' ? 'Video' : 'Image'}
          </span>
          {data.hdurl && (
            <a
              href={data.hdurl}
              target="_blank"
              rel="noreferrer"
              className="bg-glow text-void font-medium text-sm rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
            >
              View HD image
            </a>
          )}
        </div>
      </motion.div>
    </main>
  )
}