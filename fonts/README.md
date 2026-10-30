# Fonts

`david-libre-hebrew-400.woff2`, `-500.woff2`, `-700.woff2` — the Hebrew-block subsets of **David Libre**
(the free release of the classic David typeface), used only when the UI language is Hebrew. Cinzel and
Crimson Pro (loaded from Google Fonts) have no Hebrew glyphs, so `styles.css` aliases these files to both
family names with `unicode-range: U+0590-05FF, U+FB1D-FB4F` — English text never uses them.

Source: Google Fonts (`https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700`, the `hebrew` subset).
License: SIL Open Font License 1.1 (`https://openfontlicense.org`).
