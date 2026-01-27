/** @type {import('tailwindcss').Config} */

function withOpacityValue(variable) {
    return ({ opacityValue }) => {
        if (opacityValue === undefined) {
            return `rgb(var(${variable}))`
        }
        return `rgb(var(${variable}) / ${opacityValue})`
    }
}

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": withOpacityValue('--color-primary'),
                "primary-light": withOpacityValue('--color-primary-light'),
                "background": withOpacityValue('--color-background'),
                "surface": withOpacityValue('--color-surface'),
                "surface-hover": withOpacityValue('--color-surface-hover'),
                "border": withOpacityValue('--color-border'),
                "text-primary": withOpacityValue('--color-text-primary'),
                "text-secondary": withOpacityValue('--color-text-secondary'),
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
