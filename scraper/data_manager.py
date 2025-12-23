#!/usr/bin/env python3
"""
Data Manager for MX Error Guide
Handles splitting, combining, and validating error data files.

Usage:
    python data_manager.py split    # Split errors.json into chunks (max 20 each)
    python data_manager.py combine  # Combine chunks back to errors.json
    python data_manager.py validate # Validate all data files
    python data_manager.py stats    # Show statistics
"""

import json
import os
import sys
from pathlib import Path
from collections import Counter

# Configuration
MAX_ERRORS_PER_FILE = 20
DATA_DIR = Path(__file__).parent.parent / "public" / "data"
CHUNKS_DIR = DATA_DIR / "chunks"
MAIN_FILE = DATA_DIR / "errors.json"

def ensure_dirs():
    """Create necessary directories."""
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

def load_main_file():
    """Load the main errors.json file."""
    if not MAIN_FILE.exists():
        print(f"Error: {MAIN_FILE} not found")
        sys.exit(1)
    with open(MAIN_FILE, 'r') as f:
        return json.load(f)

def split_errors():
    """Split errors.json into smaller chunk files (max 20 each)."""
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
                chunk_file = CHUNKS_DIR / f"errors_{chunk_num:03d}.json"
                save_chunk(chunk_file, current_chunk, chunk_num)
                chunks_created.append((chunk_file.name, len(current_chunk)))
                chunk_num += 1
                current_chunk = []

    # Save remaining errors
    if current_chunk:
        chunk_file = CHUNKS_DIR / f"errors_{chunk_num:03d}.json"
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
    """Combine all chunk files back into errors.json."""
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

def validate_data():
    """Validate all data files."""
    print("Validating data files...\n")

    issues = []

    # Validate main file
    if MAIN_FILE.exists():
        try:
            data = load_main_file()
            errors = data.get('errors', [])
            print(f"✅ errors.json: {len(errors)} errors (valid JSON)")

            # Check for duplicates
            codes = [e['code'] for e in errors]
            duplicates = [code for code, count in Counter(codes).items() if count > 1]
            if duplicates:
                issues.append(f"Duplicate codes in errors.json: {duplicates}")

            # Check required fields
            required = ['code', 'name', 'category', 'severity', 'description']
            for i, error in enumerate(errors):
                missing = [f for f in required if f not in error]
                if missing:
                    issues.append(f"Error {error.get('code', i)}: missing fields {missing}")
        except json.JSONDecodeError as e:
            issues.append(f"errors.json: Invalid JSON - {e}")
    else:
        issues.append("errors.json not found")

    # Validate chunks
    if CHUNKS_DIR.exists():
        chunk_files = list(CHUNKS_DIR.glob("errors_*.json"))
        total_in_chunks = 0
        for chunk_file in sorted(chunk_files):
            try:
                with open(chunk_file, 'r') as f:
                    chunk = json.load(f)
                    count = len(chunk.get('errors', []))
                    total_in_chunks += count
                    if count > MAX_ERRORS_PER_FILE:
                        issues.append(f"{chunk_file.name}: {count} errors (exceeds max {MAX_ERRORS_PER_FILE})")
                    else:
                        print(f"✅ {chunk_file.name}: {count} errors")
            except json.JSONDecodeError as e:
                issues.append(f"{chunk_file.name}: Invalid JSON - {e}")

        print(f"\n📊 Total in chunks: {total_in_chunks}")

    # Report issues
    if issues:
        print(f"\n❌ Issues found ({len(issues)}):")
        for issue in issues:
            print(f"   - {issue}")
        return False
    else:
        print("\n✅ All validations passed!")
        return True

def show_stats():
    """Show statistics about the data."""
    data = load_main_file()
    errors = data.get('errors', [])

    print("📊 MX Error Guide Statistics\n")
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
        chunk_files = list(CHUNKS_DIR.glob("errors_*.json"))
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
    elif command == 'validate':
        validate_data()
    elif command == 'stats':
        show_stats()
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)

if __name__ == '__main__':
    main()
