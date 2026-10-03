# Fonts

`frank-ruhl-libre-hebrew.woff2` — the Hebrew-block subset (variable weight 300–900) of **Frank Ruhl Libre**,
used only when the UI language is Hebrew. Cinzel and Crimson Pro (loaded from Google Fonts) have no Hebrew
glyphs, so `styles.css` aliases this file to both family names with `unicode-range: U+0590-05FF, U+FB1D-FB4F` —
English text never uses it.

Source: Google Fonts (`https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300..900`).
License: SIL Open Font License 1.1 (`https://openfontlicense.org`).
