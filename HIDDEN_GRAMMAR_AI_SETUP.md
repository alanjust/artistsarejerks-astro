# Hidden Grammar AI Analysis - Setup Complete

## What Was Built

I've created **two separate Hidden Grammar tools** for different use cases:

### 1. **Training/Education Form** (Preserved)
- **URL**: `/hidden-grammar/analyze`
- **Purpose**: Manual learning tool where users fill out the analysis themselves
- **Use Case**: Teaching the Hidden Grammar framework, training students
- **Status**: ✅ Working (Safari Shadow DOM issues fixed)

### 2. **AI-Powered Analysis** (New)
- **URL**: `/hidden-grammar/ai-analyze`
- **Purpose**: Instant AI analysis using Claude's vision capabilities
- **Use Case**: Quick analysis, demonstrations, general public use
- **Status**: ⚠️ Requires API key setup

---

## How the AI Analysis Works

### User Flow:
1. User uploads artwork image
2. Optionally provides metadata (title, artist, year, medium)
3. Selects analysis mode (Strategic, WIP, Historian, etc.)
4. Clicks "Analyze with AI"
5. Image is sent to Claude API with Hidden Grammar framework prompt
6. AI generates complete analysis following the framework
7. Results are displayed with export options

### Technical Architecture:
```
Frontend (ai-analyze.astro)
  ↓ (uploads image + metadata)
API Endpoint (/api/analyze-artwork.ts)
  ↓ (sends to Claude with framework context)
Claude Vision API
  ↓ (returns structured analysis)
Frontend (displays formatted results)
```

---

## Setup Required

### 1. Get Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key

### 2. Configure Environment Variable
Open `.env` file and replace `your-api-key-here` with your actual API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...your-actual-key...
```

### 3. Restart Dev Server
```bash
npm run dev
```

### 4. Test the Tool
Visit: `http://localhost:4321/hidden-grammar/ai-analyze`

---

## Files Created/Modified

### New Files:
- ✅ `/src/pages/hidden-grammar/ai-analyze.astro` - AI analysis interface
- ✅ `/src/pages/api/analyze-artwork.ts` - API endpoint for Claude integration
- ✅ `.env` - Environment variables (add your API key here)
- ✅ `HIDDEN_GRAMMAR_AI_SETUP.md` - This file

### Modified Files:
- ✅ `/src/pages/hidden-grammar/analyze.astro` - Fixed Safari Shadow DOM issue
- ✅ `package.json` - Added @anthropic-ai/sdk dependency

---

## API Endpoint Details

### Endpoint: `POST /api/analyze-artwork`

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "title": "Starry Night",
  "artist": "Vincent van Gogh",
  "year": "1889",
  "medium": "Oil on canvas",
  "mode": "strategic"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "<h1>Hidden Grammar Analysis</h1>...",
  "raw": "# Hidden Grammar Analysis\n..."
}
```

### What the API Does:
1. Receives uploaded image (base64)
2. Loads Hidden Grammar framework data (Roots, Principles, Modes)
3. Builds comprehensive system prompt with framework
4. Sends image + prompt to Claude Sonnet 4.5 via Vision API
5. Receives AI analysis following the framework structure
6. Converts markdown to HTML for display
7. Returns formatted analysis

---

## Analysis Structure

The AI generates analysis following this structure:

1. **Case Metadata** - Title, artist, date, medium
2. **Raw Observations** - Observable visual facts only
3. **Attention Mapping** - Snags, slides, hooks
4. **Principle Mapping** - 3-5 principles with evidence
5. **Root Hypothesis** - 1-2 Roots (RAP-gated)
6. **Transmission & Friction** - Friction level, misreading risks
7. **Verdict & Recommendation** - Honest/dishonest, justification, one clarifying move

---

## Differences Between the Two Tools

| Feature | Training Form (`/analyze`) | AI Analysis (`/ai-analyze`) |
|---------|---------------------------|----------------------------|
| **Input** | User fills out all fields | User uploads image only |
| **Analysis** | Manual (educational) | Automatic (AI-powered) |
| **Time** | 15-30 minutes | 30-60 seconds |
| **Use Case** | Learning the framework | Quick analysis |
| **Output** | User's own analysis | AI-generated analysis |
| **Cost** | Free | API costs (~$0.01-0.05/image) |

---

## Cost Estimate

Claude Sonnet 4.5 pricing (as of Jan 2025):
- **Input**: ~$3 per million tokens
- **Output**: ~$15 per million tokens

Per analysis:
- System prompt: ~2,000 tokens
- Image: ~1,500 tokens (typical)
- Output: ~2,000 tokens
- **Total cost**: ~$0.01-0.05 per analysis

---

## Next Steps

### Immediate:
1. ✅ Add your Anthropic API key to `.env`
2. ✅ Restart dev server
3. ✅ Test the AI analysis tool

### Future Enhancements:
- [ ] Add more analysis modes from the framework
- [ ] Implement result caching to reduce API costs
- [ ] Add image quality/size validation
- [ ] Create gallery of example analyses
- [ ] Add comparison mode (analyze multiple works)
- [ ] Export to PDF with formatting
- [ ] Add rate limiting for public deployment

---

## Troubleshooting

### "Failed to analyze artwork"
- Check that `.env` has valid API key
- Verify dev server was restarted after adding key
- Check browser console for specific error

### "No image provided"
- Ensure image upload completed successfully
- Check image size (max 10MB)
- Verify image format (JPG, PNG, WebP)

### Analysis takes too long
- Large images take longer (resize if needed)
- API can take 20-60 seconds for complex analysis
- Check network connection

### Safari issues
- The AI analysis page should work fine in Safari
- If issues persist, test in Chrome/Firefox

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` to git (already in `.gitignore`)
- API key gives access to your Anthropic account
- Consider rate limiting for public deployment
- Monitor API usage in Anthropic console

---

## Questions?

- **Framework documentation**: See `HIDDEN_GRAMMAR_COMPLETE.md`
- **API documentation**: https://docs.anthropic.com/
- **Astro documentation**: https://docs.astro.build/

Ready to analyze some art! 🎨
