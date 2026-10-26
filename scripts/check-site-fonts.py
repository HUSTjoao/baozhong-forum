"""Check shard hashes, unicode coverage and all built-in major copy."""
import hashlib
import json
from pathlib import Path
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
records = json.loads((root / 'data/site-fonts.json').read_text(encoding='utf-8'))
major_text = ''.join(p.read_text(encoding='utf-8') for p in (root / 'data').glob('major*.ts'))
major_chars = {ord(c) for c in major_text if '\u3400' <= c <= '\u9fff'}
for record in records:
    source = set(TTFont(root / 'public/fonts' / record['source']).getBestCmap())
    combined = set()
    for shard in record['shards']:
        file = root / 'public/fonts/site' / shard['file']
        blob = file.read_bytes()
        assert len(blob) == shard['bytes'], file
        assert hashlib.sha256(blob).hexdigest()[:12] in file.name, file
        actual = set(TTFont(file).getBestCmap())
        declared = set()
        for item in shard['unicodeRange'].split(','):
            bounds = [int(s, 16) for s in item[2:].split('-')]
            declared.update(range(bounds[0], bounds[-1] + 1))
        # OpenType layout closure may retain extra mirrored glyph mappings.
        # Only declared ranges participate in browser font matching.
        assert declared <= actual <= source, file
        assert shard.get('priority') or not combined.intersection(declared), file
        combined.update(declared)
    assert combined == source, record['family']
    assert not major_chars - combined, record['family']
    print('PASS:', record['family'], len(combined), 'characters; full major copy covered')
