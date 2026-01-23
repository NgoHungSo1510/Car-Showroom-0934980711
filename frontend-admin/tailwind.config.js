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
                "background-dark": "#0B0E14",
                "card-dark": "#161B22",
                "border-dark": "#21262D",
                "accent-blue": "#3399FF"
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
