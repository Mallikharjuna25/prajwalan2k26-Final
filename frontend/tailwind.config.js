/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: "#7c3aed", dark: "#5b21b6", light: "#a78bfa" },
                accent: { DEFAULT: "#06b6d4", dark: "#0891b2" },
                surface: { DEFAULT: "#0f0f1a", card: "#1a1a2e", border: "#2d2d44" },
                neon: { purple: "#c084fc", cyan: "#67e8f9" }
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                heading: ["Space Grotesk", "sans-serif"]
            },
            backgroundImage: {
                "gradient-neon": "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
                "gradient-dark": "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)"
            },
            backdropBlur: { xs: "2px" },
            boxShadow: {
                neon: "0 0 20px rgba(124, 58, 237, 0.3)",
                "neon-cyan": "0 0 20px rgba(6, 182, 212, 0.3)",
                glass: "0 8px 32px rgba(0, 0, 0, 0.3)"
            }
        }
    },
    plugins: [],
}
