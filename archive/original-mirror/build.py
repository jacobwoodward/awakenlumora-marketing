#!/usr/bin/env python3
"""Build a self-contained static mirror of the Lumora sales page from kajabi-raw.html."""
import re

src = open('kajabi-raw.html', encoding='utf-8').read()
html = src

# ---------------------------------------------------------------------------
# 1) Image URL rewrites (kajabi-cdn -> local assets/img). Keyed by unique
#    filename token; matches full URL incl. optional ?query.
# ---------------------------------------------------------------------------
img_map = {
    'ada742f-47e-b2d8-c20c-d6e07f553f8_black_letters_logo': 'logo_black.png',
    'fb484ae-56ad-fb5b-5d81-3d584f04cc25_black_letters_logo': 'logo_black2.png',
    '15b5fa1-8378-5863-a02a-8d324a3d1d1d_3': 'img_3.png',
    '2030200-86d8-63f2-0e43-40fd27c15442_5': 'img_5.png',
    '3dee6af-4e3d-0dbb-c850-73c114f64a3_44': 'img_44.png',
    '4574fe6-f887-b01-8627-86744e3d61be_4': 'img_4.png',
    '488e382-bf5-a2a2-cd27-21ac7f5da5a_2': 'img_2.png',
    '55eb1b8-df15-aebc-d2d-53ae556eaac1_1': 'img_1.png',
    '5de661-83c6-e271-d871-8124301462_MOBILE': 'mobile.jpg',
    '82b6b4b-121d-0e5-d8ab-2dcdbd5138a_43': 'img_43.png',
    'c813b15-e84a-2e00-b113-3608a0f215_BANNER-2': 'banner_2.jpg',
    'd185a7-5a6-36dd-82-3ffaeaccac4_BANNER-1B': 'banner_1b.jpg',
    'dfd137d-102a-a81-3cd1-80766041e8e_MOBILE-3': 'mobile_3.jpg',
}
# Each kajabi-cdn image URL -> local path (regex eats scheme..ext..optional query)
for token, local in img_map.items():
    pat = re.compile(r'https://kajabi-storefronts-production\.kajabi-cdn\.com/[^"\')\s]*'
                     + re.escape(token) + r'[^"\')\s]*')
    html = pat.sub('assets/img/' + local, html)

# placeholder.png (theme asset)
html = re.sub(r'https://kajabi-storefronts-production\.kajabi-cdn\.com/[^"\')\s]*placeholder\.png[^"\')\s]*',
              'assets/img/placeholder.png', html)

# ---------------------------------------------------------------------------
# 2) Stylesheet + theme JS rewrites
# ---------------------------------------------------------------------------
css_js_map = [
    (r'https://kajabi-storefronts-production\.kajabi-cdn\.com/[^"\')\s]*assets/styles\.css[^"\')\s]*', 'assets/css/styles.css'),
    (r'https://kajabi-storefronts-production\.kajabi-cdn\.com/[^"\')\s]*assets/overrides\.css[^"\')\s]*', 'assets/css/overrides.css'),
    (r'https://kajabi-storefronts-production\.kajabi-cdn\.com/[^"\')\s]*assets/scripts\.js[^"\')\s]*', 'assets/js/scripts.js'),
    (r'https://kajabi-app-assets\.kajabi-cdn\.com/assets/core-[a-f0-9]+\.css', 'assets/css/core.css'),
    (r'https://cdn\.jsdelivr\.net/npm/@kajabi-ui/styles@[^"\')\s]*kajabi_products\.css', 'assets/css/kajabi_products.css'),
]
for pat, local in css_js_map:
    html = re.sub(pat, local, html)

# Google Fonts stylesheet -> local fonts.css
html = re.sub(r'(//|https://)fonts\.googleapis\.com/css\?family=[^"\')\s]*', 'assets/css/fonts.css', html)

# Cormorant Garamond inline @font-face src -> local
html = re.sub(r'https://fonts\.gstatic\.com/s/cormorantgaramond/[^"\')\s]*\.woff2',
              'assets/fonts/cormorant-garamond-300italic.woff2', html)

# ---------------------------------------------------------------------------
# 3) Remove tracking + Kajabi app-runtime + unused external scripts
# ---------------------------------------------------------------------------
kill_script_substrings = [
    'track_analytics-', 'trackProductAnalytics-', 'track_product_analytics-',
    'encore_core-', '@pine-ds/core', 'use.fontawesome.com',
]
def strip_tags(h, tag, needles):
    # remove <tag ...needle...>...</tag> or self-closing/void variants
    out = h
    for needle in needles:
        # script/link blocks containing the needle in their attributes
        out = re.sub(r'<' + tag + r'\b[^>]*' + re.escape(needle) + r'[^>]*>(?:.*?</' + tag + r'>)?',
                     '', out, flags=re.DOTALL)
    return out

html = strip_tags(html, 'script', kill_script_substrings)
html = strip_tags(html, 'link', ['use.fontawesome.com'])
# preconnect/dns-prefetch/preload to kajabi app + fontawesome + gstatic (self-hosted now)
html = re.sub(r'<link\b[^>]*(kajabi-app-assets|use\.fontawesome\.com|pine-ds|fonts\.gstatic\.com|fonts\.googleapis\.com)[^>]*>', '', html)

# Remove inline <script> blocks carrying tracking/runtime signatures
inline_kill = ['rudderanalytics', 'rudderAnalyticsMount', 'rs-dp.kajabi.com',
               'health_check/ping', 'KajabiDataPipeline', 'window.Kajabi']
for needle in inline_kill:
    html = re.sub(r'<script\b[^>]*>(?:(?!</script>).)*?' + re.escape(needle) + r'(?:(?!</script>).)*?</script>',
                  '', html, flags=re.DOTALL)

# Remove the "Powered by Kajabi" footer badge
html = re.sub(r'<aside class="powered-by[^"]*">.*?</aside>', '', html, flags=re.DOTALL)

# Self-host jQuery + a small compatibility shim for the globals Kajabi's app
# bundle used to provide (isFramed(), Kajabi.theme.*). The theme scripts.js
# depends on these; on a live standalone page they resolve to "not in editor,
# not framed", which is the behaviour we want. Injected right before scripts.js.
shim = (
    '<script src="assets/js/jquery.min.js"></script>\n'
    '<script>'
    'window.isFramed=function(){try{return window.self!==window.top;}catch(e){return true;}};'
    'window.Kajabi=window.Kajabi||{};'
    'window.Kajabi.theme=window.Kajabi.theme||{editor:false,previewThemeId:null};'
    'window.Kajabi.nextPipelineStepUrl=window.Kajabi.nextPipelineStepUrl||"";'
    '</script>\n'
)
html = re.sub(r'(<script\b[^>]*src="assets/js/scripts\.js"[^>]*></script>)',
              shim + r'\1', html, count=1)

# ---------------------------------------------------------------------------
# 4) Nav / member-area links -> Lumora app
# ---------------------------------------------------------------------------
html = html.replace('href="/login"', 'href="https://app.awakenlumora.com/login"')
html = html.replace('https://colleen-aloian.mykajabi.com/library', 'https://app.awakenlumora.com')
html = html.replace('https://colleen-aloian.mykajabi.com/store', 'https://app.awakenlumora.com')
html = html.replace('https://colleen-aloian.mykajabi.com/lumora-sales-page', '/')
html = html.replace('https://colleen-aloian.mykajabi.com', 'https://app.awakenlumora.com')

# ---------------------------------------------------------------------------
# 5) Favicon -> Lumora community icon (same as app.awakenlumora.com)
# ---------------------------------------------------------------------------
favicon_tags = ('<link rel="icon" type="image/png" href="assets/img/favicon.png" />\n'
                '    <link rel="apple-touch-icon" href="assets/img/favicon.png" />')
# Replace the existing shortcut-icon link (whatever it points to) with the new tags.
html, n = re.subn(r'<link\b[^>]*rel="(?:shortcut icon|icon)"[^>]*/?>', favicon_tags, html, count=1)
if n == 0:  # no existing icon link found; inject before </head>
    html = html.replace('</head>', '    ' + favicon_tags + '\n</head>', 1)

open('site/index.html', 'w', encoding='utf-8').write(html)

# Report leftover external kajabi/gstatic/googleapis references
leftovers = re.findall(r'https?:[^"\')\s]*(?:kajabi|gstatic|googleapis|fontawesome)[^"\')\s]*', html)
print('Wrote site/index.html (%d bytes)' % len(html))
print('Remaining external refs to kajabi/gstatic/googleapis/fontawesome:', len(leftovers))
for u in sorted(set(leftovers))[:40]:
    print('  ', u)
