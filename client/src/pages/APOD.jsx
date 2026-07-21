import { motion } from 'framer-motion'
import { useAPOD } from '../hooks/useAPOD.js'
import { Loader, ErrorMessage } from '../components/UI/Status.jsx'

export default function APOD() {
  const { data, isLoading, error } = useAPOD()

  if (isLoading) return <Loader label="Aligning telescope" />
  if (error) return <div className="p-8"><ErrorMessage message={error.message} /></div>

  return (
    <main className="grid lg:grid-cols-[1.4fr_1fr] min-h-[calc(100vh-61px)]">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-panel flex items-center justify-center overflow-hidden"
      >
        {data.media_type === 'image' ? (
          <img
            src={data.url}
            alt={data.title}
            className="w-full h-full object-cover max-h-[80vh]"
          />
        ) : (
          <iframe
            src={data.url}
            title={data.title}
            className="w-full aspect-video"
            allowFullScreen
          />
        )}

       
        <div className="absolute bottom-0 inset-x-0 p-4 flex gap-2 bg-gradient-to-t from-void to-transparent">
          <span className="telemetry telemetry-accent border border-hairline rounded-full px-3 py-1">
            {data.media_type}
          </span>
          {data.hdurl && (
            <span className="telemetry border border-hairline rounded-full px-3 py-1">
              HD available
            </span>
          )}
        </div>
      </motion.div>

  
      <div className="flex">
      
        <div className="w-px bg-hairline relative shrink-0">
          <span className="absolute top-10 -left-[3px] w-[7px] h-[7px] rounded-full bg-glow" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="p-7 flex-1"
        >
          <p className="telemetry telemetry-accent mb-4">
            Astronomy picture of the day
          </p>

          <h1 className="font-display font-semibold text-3xl leading-tight mb-4">
            {data.title}
          </h1>

          <p className="text-soft text-sm leading-7 mb-6">
            {data.explanation}
          </p>

       
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-panel rounded-xl px-4 py-3">
              <p className="telemetry mb-1">Date</p>
              <p className="font-mono text-sm">{data.date}</p>
            </div>
            <div className="bg-panel rounded-xl px-4 py-3">
              <p className="telemetry mb-1">Credit</p>
              <p className="font-mono text-sm truncate">
                {data.copyright?.trim() || 'NASA / Public domain'}
              </p>
            </div>
          </div>

          {data.hdurl && (
            <a
              href={data.hdurl}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-glow text-void font-medium text-sm rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity"
            >
              View HD image
            </a>
          )}
        </motion.div>
      </div>
    </main>
  )
}