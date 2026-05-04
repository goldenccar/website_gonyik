import React from 'react'

interface MarkupParserProps {
  text: string
  className?: string
}

/**
 * 解析自定义标记语言：
 * <i>...</i>   → 引用（斜体小字灰色）
 * <b>...</b>   → 高亮（粗体）
 * <note>...</note> → 备注（小字灰色）
 * /h           → 换行（段落分隔）
 */
export default function MarkupParser({ text, className = '' }: MarkupParserProps) {
  if (!text) return null

  // 先按 /h 分割为段落
  const paragraphs = text.split('/h').filter((p) => p.trim())

  return (
    <div className={className}>
      {paragraphs.map((paragraph, idx) => (
        <p key={idx} className="mb-4 last:mb-0">
          {parseInlineMarkup(paragraph.trim())}
        </p>
      ))}
    </div>
  )
}

function parseInlineMarkup(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = []
  let remaining = text
  let key = 0

  // 按优先级匹配标记：<note> <i> <b>
  const patterns = [
    { regex: /<note>(.*?)<\/note>/s, wrapper: (content: string, k: number) => <span key={k} className="text-[12px] text-muted">{parseInlineMarkup(content)}</span> },
    { regex: /<i>(.*?)<\/i>/s, wrapper: (content: string, k: number) => <em key={k} className="text-[13px] text-muted italic block mt-2 mb-2 pl-3 border-l-2 border-white/20">{parseInlineMarkup(content)}</em> },
    { regex: /<b>(.*?)<\/b>/s, wrapper: (content: string, k: number) => <strong key={k} className="font-bold text-primary">{parseInlineMarkup(content)}</strong> },
  ]

  while (remaining.length > 0) {
    let earliestMatch: { pattern: typeof patterns[0]; index: number; match: RegExpMatchArray } | null = null

    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags)
      const match = remaining.match(regex)
      if (match && match.index !== undefined) {
        if (!earliestMatch || match.index < earliestMatch.index) {
          earliestMatch = { pattern, index: match.index, match }
        }
      }
    }

    if (earliestMatch) {
      // 添加匹配前的普通文本
      if (earliestMatch.index > 0) {
        result.push(<span key={key++}>{remaining.slice(0, earliestMatch.index)}</span>)
      }
      // 添加解析后的标记内容
      const content = earliestMatch.match[1]
      result.push(earliestMatch.pattern.wrapper(content, key++))
      // 更新剩余文本
      remaining = remaining.slice(earliestMatch.index + earliestMatch.match[0].length)
    } else {
      // 没有更多标记，添加剩余文本
      result.push(<span key={key++}>{remaining}</span>)
      break
    }
  }

  return result
}
