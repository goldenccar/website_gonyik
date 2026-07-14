const CJK_PATTERN = /[\u3400-\u9fff]/

export function headingLanguageClass(text = '') {
  return CJK_PATTERN.test(text.replace(/<[^>]+>/g, '')) ? '' : 'type-heading-en'
}
