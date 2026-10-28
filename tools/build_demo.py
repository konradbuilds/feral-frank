"""Build the public, backend-free GitHub Pages preview from an asset allowlist."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent.parent
out = root / 'docs'
out.mkdir(exist_ok=True)
assets = '''app.html index.html about.html workspace.css home.css
storage.js storage-controls.js connection.js ai-setup.js character.js workspace.js mobile.js
onboarding.js public-demo.js frank.png og-image-v2.png
favicon.svg favicon.png icon.svg icon-180.png icon-192.png icon-512.png
icon-maskable-512.png manifest.webmanifest sw.js LICENSE.txt SETUP.md'''.split()
for name in assets:
    shutil.copy2(root / name, out / name)
(out / '.nojekyll').touch()
print(f'Public preview: {len(assets)} allowlisted assets; no backend or secrets.')
