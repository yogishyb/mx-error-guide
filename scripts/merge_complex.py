import json
import os

base_path = 'frontend/public/data'
main_file = os.path.join(base_path, 'real_world_examples.json')
new_file = os.path.join(base_path, 'complex_examples.json')

def load_json(path):
    with open(path, 'r') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

try:
    if not os.path.exists(new_file):
        print(f"File not found: {new_file}")
        exit(1)

    main_data = load_json(main_file)
    new_data = load_json(new_file)
    
    existing_ids = set(e['id'] for e in main_data['examples'])
    added_count = 0
    
    for example in new_data:
        if example['id'] not in existing_ids:
            main_data['examples'].append(example)
            existing_ids.add(example['id'])
            added_count += 1
            
    # Update metadata
    main_data['metadata']['example_count'] = len(main_data['examples'])
    
    # Update categories list
    all_categories = set(main_data['metadata']['categories'])
    for ex in new_data:
        all_categories.add(ex['category'])
    main_data['metadata']['categories'] = sorted(list(all_categories))
    
    save_json(main_file, main_data)
    print(f"Successfully added {added_count} complex examples. Total: {main_data['metadata']['example_count']}")
    
    # Remove the temp file
    os.remove(new_file)

except Exception as e:
    print(f"Error: {e}")
