# 📄 Code Guide for `frontend/src/admin/tabs.tsx`

> **Target File:** [`frontend/src/admin/tabs.tsx`](file:///d:/Downloads/Potfolio-main/frontend/src/admin/tabs.tsx)

This guide documents the updated changes applied to `frontend/src/admin/tabs.tsx`:

---

## 🛠️ Summary of Changes Made to `frontend/src/admin/tabs.tsx`

1. **Icons Import Updated**: Added `MoveToTopIcon` and `MoveToBottomIcon`.
2. **`ReorderButtons` Component Added**: Reusable compact icon-button group for 4-way item reordering (**Top**, **Up ↑**, **Down ↓**, **Bottom**).
3. **`ProjectsTab` Updated**: Position indicator (`#1`, `#2`...) and `ReorderButtons` component added to each project item.
4. **`ReviewsTab` Updated**: `moveReview` state handler added with `ReorderButtons` component on each review item.
5. **`TestimonialsTab` Updated**: `moveTestimonial` state handler added with `ReorderButtons` component on each testimonial item.

---

## 📍 Line-by-Line Changes for `frontend/src/admin/tabs.tsx`

### 1️⃣ Compact Reorder Buttons Component

```tsx
function ReorderButtons({
  index,
  total,
  onMove,
}: {
  index: number;
  total: number;
  onMove: (direction: "top" | "up" | "down" | "bottom") => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onMove("top")}
        disabled={index === 0}
        title="Move to top"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-gray-400 transition-all hover:bg-accent hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-gray-400"
      >
        <MoveToTopIcon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onMove("up")}
        disabled={index === 0}
        title="Move up"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-gray-400 transition-all hover:bg-accent hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-gray-400"
      >
        <ArrowUpIcon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onMove("down")}
        disabled={index === total - 1}
        title="Move down"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-gray-400 transition-all hover:bg-accent hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-gray-400"
      >
        <ArrowDownIcon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onMove("bottom")}
        disabled={index === total - 1}
        title="Move to bottom"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-gray-400 transition-all hover:bg-accent hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-gray-400"
      >
        <MoveToBottomIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
```
