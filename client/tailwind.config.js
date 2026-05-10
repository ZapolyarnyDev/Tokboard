/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)"
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          active: "var(--color-accent-active)",
          light: "var(--color-accent-light)"
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)"
        },
        border: {
          DEFAULT: "var(--color-border-default)",
          hover: "var(--color-border-hover)",
          active: "var(--color-border-active)"
        }
      },
      fontFamily: {
        heading: ["JetBrains Mono", "monospace"],
        body: ["Inter", "sans-serif"]
      },
      borderRadius: {
        none: "0px"
      },
      transitionDuration: {
        DEFAULT: "150ms"
      }
    }
  },
  plugins: []
}