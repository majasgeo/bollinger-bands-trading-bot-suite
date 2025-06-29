# Contributing to Bollinger Bands Trading Bot Suite

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/majasgeo/bollinger-bands-trading-bot-suite.git
   cd bollinger-bands-trading-bot-suite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/      # React components for UI
├── utils/          # Utility functions and strategies
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
├── main.tsx        # Application entry point
└── index.css       # Global styles
```

## Adding a New Strategy

1. Create strategy implementation in `src/utils/strategies/`
2. Create UI component in `src/components/`
3. Add types in `src/types/`
4. Import and integrate in `App.tsx`

## Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add proper type definitions
- Comment complex logic

## Testing

Before submitting changes:
1. Ensure the app builds: `npm run build`
2. Check for TypeScript errors: `npm run lint`
3. Test all strategies with sample data

## Pull Requests

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit PR with clear description