CREATE TABLE x_post_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_name TEXT NOT NULL,
  variation_a TEXT NOT NULL,
  variation_b TEXT NOT NULL,
  variation_c TEXT NOT NULL,
  selected_variation TEXT,
  edited_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  rotation_index INTEGER NOT NULL,
  posted_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_x_post_drafts_status ON x_post_drafts(status);
CREATE INDEX idx_x_post_drafts_created_at ON x_post_drafts(created_at);
