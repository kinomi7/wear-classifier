import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  base: "/wear-classifier/",
  plugins: [react()],
  build: {
    outDir: "docs",
    emptyOutDir: true
  }
})
