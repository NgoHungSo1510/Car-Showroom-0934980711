/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#0066FF",
                "primary-light": "#3399FF",
                "background": "#0A0A0B",
                "surface": "#141416",
                "surface-hover": "#1A1A1D",
                "border": "#27272A",
                "text-primary": "#FAFAFA",
                "text-secondary": "#A1A1AA",
                "accent": "#10B981",
            },
            fontFamily: {
                "sans": ["Inter", "system-ui", "sans-serif"],
                "display": ["Space Grotesk", "sans-serif"],
            },
            animation: {
                "float": "float 6s ease-in-out infinite",
                "glow": "glow 2s ease-in-out infinite alternate",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                glow: {
                    "0%": { boxShadow: "0 0 20px rgba(0, 102, 255, 0.3)" },
                    "100%": { boxShadow: "0 0 40px rgba(0, 102, 255, 0.6)" },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
