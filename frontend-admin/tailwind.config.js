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
                // Primary accent
                "primary": "#0066FF",
                "accent-blue": "#3399FF",

                // Dark mode colors
                "background-dark": "#0B0E14",
                "card-dark": "#161B22",
                "border-dark": "#21262D",

                // Light mode colors
                "background-light": "#F8FAFC",
                "card-light": "#FFFFFF",
                "border-light": "#E2E8F0",
                "text-light": "#0F172A",
                "text-muted-light": "#64748B",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"]
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}

