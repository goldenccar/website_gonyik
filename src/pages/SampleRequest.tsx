import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import SampleForm from '@/components/SampleForm'

export default function SampleRequest() {
  return (
    <div className="bg-darker flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-8">
          <Link to="/fabrics" className="flex items-center gap-2 text-accent hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} />
            <span className="text-[13px]">返回面料数据库</span>
          </Link>
          <h1 className="text-[28px] md:text-[36px] font-bold text-white leading-tight">申请面料样品</h1>
          <p className="text-[14px] text-accent mt-2">填写以下信息，我们会尽快与您联系</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-12 w-full">
        <div className="bg-white/5 p-8 sm:p-10">
          <SampleForm />
        </div>
      </div>
    </div>
  )
}
