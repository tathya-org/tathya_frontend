import { getArticles, analyseArticle } from "@/lib/api"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import AnalysedBody from "@/components/AnalysedBody"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params

  const articles = await getArticles()
  const article  = articles[parseInt(id)]

  if (!article) {
    return <div>Article not found</div>
  }

  const analysis = await analyseArticle(article.headline, article.body)

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{article.headline}</h1>

      <p className="text-gray-500 text-sm mb-6">
        <a href={article.url}>{article.url}</a>
        {article.published && (
          <span className="ml-3 text-gray-400">{article.published}</span>
        )}
      </p>

      {analysis && analysis.statements.length > 0 ? (
        <AnalysedBody
          body={article.body}
          statements={analysis.statements}
          bias={analysis.article_bias}
        />
      ) : (
        <MarkdownRenderer content={article.body} />
      )}
    </main>
  )
}
