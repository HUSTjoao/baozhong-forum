# Homepage title font

`baozhong-title.ttf` is the Noto Serif SC Regular subset served by Google Fonts
for the homepage title `宝鸡中学高校论坛`, its Chinese description, and motto
`从宝中出发，在这里相逢`.
It also includes the 16 university names and motto in the scroll-driven journey.
`data/college-strokes.json` contains the actual ten stroke contours of each of
`高` and `校`, extracted from this font for the title breakup animation.
Regenerate it with `python scripts/generate-college-strokes.py` (requires fontTools)
if the title font changes. The paths retain the font's included SIL license.
The SIL Open Font License is included in `OFL-NotoSerifSC.txt`.

Source: https://fonts.google.com/specimen/Noto+Serif+SC

The font is served locally, so visitors do not need to connect to Google Fonts.
If the title or motto changes, download a subset containing the new characters.
When updating either font, update its CSS URL version with the new file's hash
so browsers fetch the new subset instead of retaining cached glyphs.

`baozhong-navigation.ttf` is a Noto Serif SC Medium (500) subset for the
navigation labels. It uses the same included SIL Open Font License.
The subset includes the labels `大学介绍`, `专业认知`, and `宝鸡中学高校论坛`.
Desktop homepage links are 20px and mobile links are 16px.

`cormorant-journey.ttf` is a Cormorant Garamond Medium Italic subset for
`Training Modern Chinese People To the World`, served locally.
Source: https://fonts.google.com/specimen/Cormorant+Garamond
Its SIL Open Font License is included in `OFL-CormorantGaramond.txt`.

`baozhong-explore.ttf` is a Noto Serif SC Regular subset for the headings in
the “下一站，大学” section, using the included Noto SIL license.

Admission Handwriting: Ma Shan Zheng (Google Fonts), subset for the admission section heading. License: OFL-MaShanZheng.txt.

Admission English: Cormorant Garamond italic 500, subset for A LETTER TO YOUR FUTURE. License: OFL-CormorantGaramond.txt.

Baozhong Dock: Noto Serif SC semibold 600, subset for the glass navigation. License: OFL-NotoSerifSC.txt.

Admission WenKai: LXGW WenKai Regular, local WOFF2 subset for the four directory entries. Source: https://github.com/lxgw/LxgwWenKai. License: OFL-LXGWWenKai.txt.
Admission Sans: Noto Sans SC Regular, local subset for directory descriptions. License: OFL-NotoSansSC.txt.

Countdown XiaoWei: ZCOOL XiaoWei Regular, local WOFF2 subset for countdown headings and learning prompts. Source: https://github.com/google/fonts/tree/main/ofl/zcoolxiaowei. License: OFL-ZCOOLXiaoWei.txt. Includes all characters in GaokaoTimeline.tsx, study-prompts.ts and countdown-slogans.ts; regenerate the subset and update its CSS hash when introducing new characters.

Countdown Serif: Noto Serif SC Medium (500), locally hosted WOFF2 subset replacing the XiaoWei trial. Source: https://github.com/google/fonts/tree/main/ofl/notoserifsc. Includes the full countdown text and prompt collection. License: OFL-NotoSerifSC.txt. Generated from the variable font at wght=500; update the CSS version hash whenever its glyph subset changes.

Baoji Brand Calligraphy: Ma Shan Zheng Regular, WOFF2 subset containing every character in the Navbar brand title. Source: https://github.com/google/fonts/tree/main/ofl/mashanzheng. License: OFL-MaShanZheng.txt. Served locally; regenerate this subset and its CSS version hash when changing the brand text.
Campus cards: Source Han Serif SC Regular (Adobe), locally subsetted WOFF2. Source: https://github.com/adobe-fonts/source-han-serif. License: OFL-SourceHanSerif.txt. Glyph subset includes university names, mottos, regions and card labels; regenerate when introducing new characters.
Campus card English: Cormorant Garamond upright Medium (500), local Latin WOFF2, from https://github.com/google/fonts/tree/main/ofl/cormorantgaramond. License: OFL-CormorantGaramond.txt.

Campus introductory heading: Ma Shan Zheng Regular, locally subsetted from https://github.com/google/fonts/tree/main/ofl/mashanzheng. License: OFL-MaShanZheng.txt.
Campus introductory description: LXGW WenKai Regular, locally subsetted from https://github.com/lxgw/LxgwWenKai. License: OFL-LXGWWenKai.txt.
Both introductory subsets cover the Chinese characters in UniversityExplorer.tsx; regenerate when editing its copy.
