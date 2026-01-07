# Understanding CSS Grid Layout

CSS Grid is a powerful layout system that makes it easy to create two-dimensional layouts. Let's dive into the fundamentals!

## What is CSS Grid?

CSS Grid Layout is a **two-dimensional layout system** for the web. It lets you lay out content in rows and columns, making it perfect for:

- Page layouts
- Card grids
- Image galleries
- Dashboard interfaces

### Grid vs Flexbox

| Feature | Grid | Flexbox |
|---------|------|---------|
| Dimensions | 2D (rows + columns) | 1D (row or column) |
| Best for | Page layouts | Component layouts |
| Alignment | Both axes | Single axis |

## Basic Grid Setup

Here's the simplest grid container:

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}
```

This creates three equal columns with a 20px gap between items.

### The `fr` Unit

The `fr` unit represents a **fraction of available space**. Think of it as:

> "Split the remaining space into equal parts"

```css
.grid {
  grid-template-columns: 2fr 1fr;
  /* First column gets 2/3, second gets 1/3 */
}
```

## Common Patterns

### Responsive Grid

```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

This automatically adjusts the number of columns based on available space!

### Named Grid Areas

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 200px 1fr;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

## Key Properties

1. **Container Properties**:
   - `display: grid` - Enable grid layout
   - `grid-template-columns` - Define column tracks
   - `grid-template-rows` - Define row tracks
   - `gap` - Space between items

2. **Item Properties**:
   - `grid-column` - Span columns
   - `grid-row` - Span rows
   - `align-self` - Vertical alignment
   - `justify-self` - Horizontal alignment

### Spanning Items

```css
.featured {
  grid-column: 1 / 3;  /* Span 2 columns */
  grid-row: 1 / 3;     /* Span 2 rows */
}
```

## Practical Example

A simple card grid:

```css
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
```

## Browser Support

CSS Grid is supported in all modern browsers:

- ✓ Chrome 57+
- ✓ Firefox 52+
- ✓ Safari 10.1+
- ✓ Edge 16+

## Tips and Tricks

- Use `grid-template-columns: repeat(12, 1fr)` for a 12-column grid system
- Combine `minmax()` with `auto-fit` for responsive layouts
- Use `grid-auto-rows` for dynamic row heights
- Debug with browser DevTools grid inspector

## Conclusion

CSS Grid revolutionized web layouts. It's intuitive, powerful, and solves problems that were previously difficult with floats or flexbox alone.

Start simple, experiment often, and you'll master it quickly!

---

*Want to learn more? Check out [CSS Tricks Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/) for comprehensive examples.*
