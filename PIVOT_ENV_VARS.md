# New Environment Variables for Pivot Pages

Add these to your `.env.local` file:

```bash
# Video Configuration (for /pivot/college sales video)
NEXT_PUBLIC_COLLEGE_VIDEO_ID=your_youtube_video_id

# Discount Store Product Links (for /pivot/store)
NEXT_PUBLIC_PLAYMAT_LINK=https://your-affiliate-link.com
NEXT_PUBLIC_DECKBOX_LINK=https://your-affiliate-link.com
NEXT_PUBLIC_APPAREL_LINK=https://your-affiliate-link.com
NEXT_PUBLIC_CHAIR_LINK=https://your-affiliate-link.com
NEXT_PUBLIC_SLEEVES_LINK=https://your-affiliate-link.com
NEXT_PUBLIC_DICE_LINK=https://your-affiliate-link.com
NEXT_PUBLIC_MOUSEPAD_LINK=https://your-affiliate-link.com
NEXT_PUBLIC_STORAGE_LINK=https://your-affiliate-link.com
```

## Notes

- Video ID is the part after `?v=` in YouTube URLs
- Product links default to `#` if not configured
- Products are centrally managed in `src/data/products.ts`
