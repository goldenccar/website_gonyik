export default function PublicContentLoader({ label = '正在加载页面内容' }: { label?: string }) {
  return (
    <div className="min-h-[72svh] bg-[#041f38]" role="status" aria-label={label}>
      <div className="mx-auto flex min-h-[72svh] w-full max-w-[1760px] items-center px-7 md:px-12 lg:px-20">
        <div className="w-full max-w-[760px]">
          <div className="h-3 w-28 animate-pulse bg-white/12" />
          <div className="mt-8 h-12 w-3/4 animate-pulse bg-white/10 md:h-16" />
          <div className="mt-4 h-5 w-1/2 animate-pulse bg-white/[0.07]" />
        </div>
      </div>
    </div>
  )
}
