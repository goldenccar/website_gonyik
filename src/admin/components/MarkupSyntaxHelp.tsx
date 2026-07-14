export default function MarkupSyntaxHelp({ mode = 'inline' }: { mode?: 'inline' | 'block' }) {
  return <p className="mt-1.5 text-[11px] leading-5 text-muted">
    标记：&lt;b&gt;重点&lt;/b&gt;、&lt;up&gt;上标&lt;/up&gt;、&lt;down&gt;下标&lt;/down&gt;
    {mode === 'block' && <>、&lt;i&gt;引用&lt;/i&gt;、&lt;note&gt;备注&lt;/note&gt;、/h 分段</>}
  </p>
}
