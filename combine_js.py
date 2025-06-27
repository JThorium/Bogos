import re

def combine_js_files(output_file, file_paths):
    combined_content = ""
    for path in file_paths:
        with open(path, 'r') as f:
            content = f.read()
            # Remove import and export statements
            content = re.sub(r'import .*? from .*?;', '', content)
            content = re.sub(r'export (const|let|var|class|function) ', r'\1 ', content)
            content = re.sub(r'export \{.*?};', '', content)
            combined_content += content + "\n"
    
    with open(output_file, 'w') as f:
        f.write(combined_content)

# Define the order of files based on dependencies
js_files_to_combine = [
    'AstroAnnihilator/src/gameData.js',
    'AstroAnnihilator/src/models.js',
    'AstroAnnihilator/src/utils.js',
    'AstroAnnihilator/src/audio.js',
    'AstroAnnihilator/src/entities.js',
    'AstroAnnihilator/src/player.js',
    'AstroAnnihilator/src/enemies.js',
    'AstroAnnihilator/src/game.js',
    'AstroAnnihilator/src/ui.js',
    'AstroAnnihilator/src/index.js',
]

# Output file
output_js_path = 'AstroAnnihilator/combined_script.js'

# Combine the JS files
combine_js_files(output_js_path, js_files_to_combine)

print(f"Combined JavaScript written to {output_js_path}")
