export type ArchivedBriefing = {
  id: string
  user_id: string
  briefing_id: string
  child_name: string
  deleted_at: string
}

export type PaperTopic = {
  category: string
  subcategory?: string
}

export type Paper = {
  id: string
  user_id: string
  briefing_id: string
  child_name: string
  reading_level: string
  topics: PaperTopic[]
  created_at: string
}

export type Article = {
  position: number
  headline: string
  body: string
  category: string
  subcategory: string
  source_name: string
  source_tier: string
  published_at: string
  word_count: number
  editorial_importance: number
  topics: string[]
}

export type Edition = {
  edition_id: number | string
  generated_at: string
  briefing_name?: string
}
