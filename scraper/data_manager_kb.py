#!/usr/bin/env python3
"""
Data Manager for Scraper Knowledge Base
Handles splitting and combining the scraper's error_knowledge_base.json into chunks.

Usage:
    python data_manager_kb.py split    # Split into chunks (max 20 each)
    python data_manager_kb.py combine  # Combine chunks back
    python data_manager_kb.py stats    # Show statistics
"""

import json
import os
import sys
from pathlib import Path
from collections import Counter

# Configuration
MAX_ERRORS_PER_FILE = 20
DATA_DIR = Path(__file__).parent / "data"
CHUNKS_DIR = DATA_DIR / "chunks"
MAIN_FILE = DATA_DIR / "error_knowledge_base.json"

def ensure_dirs():
    """Create necessary directories."""
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

def load_main_file():
    """Load the main error_knowledge_base.json file."""
    if not MAIN_FILE.exists():
        print(f"Error: {MAIN_FILE} not found")
        sys.exit(1)
    with open(MAIN_FILE, 'r') as f:
        return json.load(f)

def split_errors():
    """Split error_knowledge_base.json into smaller chunk files (max 20 each)."""
    ensure_dirs()
    data = load_main_file()
    errors = data.get('errors', [])

    if not errors:
        print("No errors to split")
        return

    # Sort by category for better organization
    errors_by_category = {}
    for error in errors:
        cat = error.get('category', 'Unknown')
        if cat not in errors_by_category:
            errors_by_category[cat] = []
        errors_by_category[cat].append(error)

    # Create chunk files by category
    chunk_num = 1
    current_chunk = []
    chunks_created = []

    for category, cat_errors in sorted(errors_by_category.items()):
        for error in cat_errors:
            current_chunk.append(error)

            if len(current_chunk) >= MAX_ERRORS_PER_FILE:
                # Save chunk
                chunk_file = CHUNKS_DIR / f"kb_{chunk_num:03d}.json"
                save_chunk(chunk_file, current_chunk, chunk_num)
                chunks_created.append((chunk_file.name, len(current_chunk)))
                chunk_num += 1
                current_chunk = []

    # Save remaining errors
    if current_chunk:
        chunk_file = CHUNKS_DIR / f"kb_{chunk_num:03d}.json"
        save_chunk(chunk_file, current_chunk, chunk_num)
        chunks_created.append((chunk_file.name, len(current_chunk)))

    # Create index file
    create_index(chunks_created)

    print(f"\n✅ Split {len(errors)} errors into {len(chunks_created)} files:")
    for name, count in chunks_created:
        print(f"   - {name}: {count} errors")
    print(f"\n📁 Location: {CHUNKS_DIR}")

def save_chunk(filepath, errors, chunk_num):
    """Save a chunk of errors to a file."""
    chunk_data = {
        "chunk": chunk_num,
        "count": len(errors),
        "errors": errors
    }
    with open(filepath, 'w') as f:
        json.dump(chunk_data, f, indent=2)

def create_index(chunks):
    """Create an index file listing all chunks."""
    index = {
        "total_chunks": len(chunks),
        "total_errors": sum(c[1] for c in chunks),
        "max_per_file": MAX_ERRORS_PER_FILE,
        "chunks": [{"file": name, "count": count} for name, count in chunks]
    }
    index_file = CHUNKS_DIR / "index.json"
    with open(index_file, 'w') as f:
        json.dump(index, f, indent=2)
    print(f"   - index.json: chunk index")

def combine_errors():
    """Combine all chunk files back into error_knowledge_base.json."""
    if not CHUNKS_DIR.exists():
        print("Error: No chunks directory found. Run 'split' first.")
        sys.exit(1)

    # Load index
    index_file = CHUNKS_DIR / "index.json"
    if not index_file.exists():
        print("Error: index.json not found")
        sys.exit(1)

    with open(index_file, 'r') as f:
        index = json.load(f)

    # Combine all chunks
    all_errors = []
    for chunk_info in index['chunks']:
        chunk_file = CHUNKS_DIR / chunk_info['file']
        with open(chunk_file, 'r') as f:
            chunk_data = json.load(f)
            all_errors.extend(chunk_data['errors'])

    # Check for duplicates
    codes = [e['code'] for e in all_errors]
    duplicates = [code for code, count in Counter(codes).items() if count > 1]
    if duplicates:
        print(f"⚠️  Warning: Duplicate codes found: {duplicates}")

    # Save combined file
    combined = {"errors": all_errors}
    with open(MAIN_FILE, 'w') as f:
        json.dump(combined, f, indent=2)

    print(f"✅ Combined {len(all_errors)} errors from {len(index['chunks'])} chunks")
    print(f"📁 Output: {MAIN_FILE}")

def show_stats():
    """Show statistics about the data."""
    data = load_main_file()
    errors = data.get('errors', [])

    print("📊 Scraper Knowledge Base Statistics\n")
    print(f"Total Errors: {len(errors)}")

    # By category
    categories = Counter(e.get('category', 'Unknown') for e in errors)
    print(f"\nBy Category:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"   {cat}: {count}")

    # By severity
    severities = Counter(e.get('severity', 'unknown') for e in errors)
    print(f"\nBy Severity:")
    for sev, count in sorted(severities.items(), key=lambda x: -x[1]):
        print(f"   {sev}: {count}")

    # Chunk info
    if CHUNKS_DIR.exists():
        chunk_files = list(CHUNKS_DIR.glob("kb_*.json"))
        print(f"\nChunk Files: {len(chunk_files)}")
        print(f"Max per file: {MAX_ERRORS_PER_FILE}")

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == 'split':
        split_errors()
    elif command == 'combine':
        combine_errors()
    elif command == 'stats':
        show_stats()
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)

if __name__ == '__main__':
    main()
