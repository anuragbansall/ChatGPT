import ReactMarkdown from 'react-markdown'

const MarkdownRenderer = ({ markdownText }) => {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{markdownText}</ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer;
