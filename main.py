import pygame
import random
from game_entities import Player, Enemy, Bullet, PowerUpItem, ENEMY_TYPES # ENEMY_TYPES is also in game_entities for now

import json

# --- Pygame Initialization ---
pygame.init()
pygame.font.init()

# --- Constants ---
SAVE_FILE = "save_data.json"
UFO_UNLOCK_CRITERIA = { # Score needed to unlock
    "BETA": 500,
    # "GAMMA": 2000 # Example for future UFO
}

# --- Screen and Display ---
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Space Invaders OOP Refactor")
clock = pygame.time.Clock()

# --- Colors (centralized) ---
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
YELLOW = (255, 255, 0)
# Other colors like BLUE, DARK_GREEN, LIGHT_GREEN, ORANGE, CYAN are defined in game_entities or implicitly via ENEMY_TYPES

# --- Fonts ---
score_font_size = 30
game_over_font_size = 72
final_score_font_size = 48
try:
    score_font = pygame.font.SysFont('arial', score_font_size)
    game_over_font = pygame.font.SysFont('arial', game_over_font_size)
    final_score_font = pygame.font.SysFont('arial', final_score_font_size)
except Exception as e:
    print(f"System font 'arial' not found, using Pygame default font: {e}")
    score_font = pygame.font.Font(None, score_font_size + 10)
    game_over_font = pygame.font.Font(None, game_over_font_size + 10)
    final_score_font = pygame.font.Font(None, final_score_font_size + 10)

# --- Game States ---
SELECTION_SCREEN = "SELECTION_SCREEN"
PLAYING = "PLAYING"
GAME_OVER = "GAME_OVER"

# --- Game Variables ---
score = 0
game_state = SELECTION_SCREEN # Start with selection screen
current_high_score = 0
unlocked_ufos_list = ["ALPHA"] 

# UFO Selection Screen Variables
selectable_ufo_keys = list(UFO_TYPES.keys()) # ["ALPHA", "BETA", ...]
current_selection_index = 0
title_font = None
ufo_name_font = None
ufo_status_font = None
try:
    title_font = pygame.font.SysFont('arial', 60)
    ufo_name_font = pygame.font.SysFont('arial', 40)
    ufo_status_font = pygame.font.SysFont('arial', 28)
except Exception as e:
    print(f"SysFont 'arial' not found for selection screen, using default: {e}")
    title_font = pygame.font.Font(None, 70)
    ufo_name_font = pygame.font.Font(None, 50)
    ufo_status_font = pygame.font.Font(None, 38)


# Enemy global properties (affecting the group)
enemy_initial_speed_x = 1 # Base horizontal speed for the group
enemy_current_speed_x = enemy_initial_speed_x 
enemy_speed_y_drop = 5 
enemy_base_shoot_chance = 0.001 

# Power-up spawning configuration
TOTAL_POWER_UP_SPAWN_CHANCE = 0.15 # Overall chance a power-up drops
POWER_UP_WEIGHTS = { # Relative likelihood of each type if a drop occurs
    "RapidFire": 60, # e.g., 60% chance for RapidFire
    "SHIELD": 40     # e.g., 40% chance for Shield
}

# --- Save/Load Game Data ---
def load_game_data():
    try:
        with open(SAVE_FILE, 'r') as f:
            data = json.load(f)
            # Basic validation for expected keys
            if "high_score" not in data or "unlocked_ufos" not in data:
                raise ValueError("Save file missing essential keys.")
            if not isinstance(data["unlocked_ufos"], list) or "ALPHA" not in data["unlocked_ufos"]:
                 data["unlocked_ufos"] = ["ALPHA"] # Ensure ALPHA is always there and it's a list
                 if "ALPHA" not in data["unlocked_ufos"]: # if original list didn't have it
                    data["unlocked_ufos"].insert(0, "ALPHA")

            return data
    except (FileNotFoundError, json.JSONDecodeError, ValueError) as e:
        print(f"Error loading save data ({e}), using defaults.")
        # Default data if file not found or corrupted
        return {"high_score": 0, "unlocked_ufos": ["ALPHA"]}

def save_game_data(data):
    try:
        with open(SAVE_FILE, 'w') as f:
            json.dump(data, f, indent=4)
    except IOError as e:
        print(f"Error saving game data: {e}")

# Load initial game data
game_progress = load_game_data()
current_high_score = game_progress.get("high_score", 0)
unlocked_ufos_list = game_progress.get("unlocked_ufos", ["ALPHA"])
if "ALPHA" not in unlocked_ufos_list: # Failsafe
    unlocked_ufos_list.insert(0, "ALPHA")


# --- Sprite Groups (initialized empty, filled by game reset) ---
all_sprites = pygame.sprite.Group()
enemies_group = pygame.sprite.Group()
player_bullets_group = pygame.sprite.Group()
enemy_bullets_group = pygame.sprite.Group()
power_ups_group = pygame.sprite.Group()

# --- Player Object (initialized after selection) ---
player = None # Will be Player(...) instance

# --- Helper Function to Reset Game Elements ---
def initialize_new_game(selected_ufo_name):
    global player, score, enemy_current_speed_x, game_state
    global all_sprites, enemies_group, player_bullets_group, enemy_bullets_group, power_ups_group

    # Reset game variables
    score = 0
    enemy_current_speed_x = enemy_initial_speed_x # Reset enemy group speed

    # Clear existing sprites
    all_sprites.empty()
    enemies_group.empty()
    player_bullets_group.empty()
    enemy_bullets_group.empty()
    power_ups_group.empty()

    # Create Player
    player = Player(ufo_type_name=selected_ufo_name)
    all_sprites.add(player)

    # Enemy Grid Setup
    enemy_rows = 3
    enemy_cols = 10
    enemy_padding = 10
    enemy_offset_x = 50
    enemy_offset_y = 50
    enemy_width = 50 
    enemy_height = 50

    for r_idx in range(enemy_rows):
        for c_idx in range(enemy_cols):
            x = enemy_offset_x + c_idx * (enemy_width + enemy_padding)
            y = enemy_offset_y + r_idx * (enemy_height + enemy_padding)
            
            enemy_type_name = "standard"
            if r_idx == 0: enemy_type_name = "tank"
            elif r_idx == 1: enemy_type_name = "scout"
            
            new_enemy = Enemy(x, y, enemy_type_name, enemy_width, enemy_height)
            all_sprites.add(new_enemy)
            enemies_group.add(new_enemy)
    
    game_state = PLAYING


# --- Main Game Loop ---
running = True
game_over_processed_this_session = False # To ensure game over logic runs once

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        
        if game_state == SELECTION_SCREEN:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP or event.key == pygame.K_LEFT:
                    current_selection_index = (current_selection_index - 1) % len(selectable_ufo_keys)
                elif event.key == pygame.K_DOWN or event.key == pygame.K_RIGHT:
                    current_selection_index = (current_selection_index + 1) % len(selectable_ufo_keys)
                elif event.key == pygame.K_RETURN or event.key == pygame.K_SPACE:
                    chosen_ufo_key = selectable_ufo_keys[current_selection_index]
                    if chosen_ufo_key in unlocked_ufos_list:
                        initialize_new_game(chosen_ufo_key)
                        game_over_processed_this_session = False # Reset for new game
                    else:
                        print(f"{chosen_ufo_key} is locked!") # Add sound effect later

        elif game_state == PLAYING:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    if player: 
                        player.shoot(all_sprites, player_bullets_group)
        elif game_state == GAME_OVER:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN or event.key == pygame.K_SPACE:
                    game_state = SELECTION_SCREEN
                    current_selection_index = 0 # Reset selection for a fresh menu display

    # --- Game Logic ---
    if game_state == PLAYING:
        if not player: # Should not happen if initialized correctly
            print("Error: Player object not found in PLAYING state. Reinitializing.")
            initialize_new_game(selectable_ufo_keys[0]) # Default to first UFO

        # Player Movement Input
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            if player: player.move("left")
        if keys[pygame.K_RIGHT]:
            if player: player.move("right")
            if player: all_sprites.update() 

            # Enemy Group Movement and Shooting
            if enemies_group: # Check if enemies exist
                for enemy_sprite in enemies_group: 
                    enemy_sprite.update_movement(enemy_current_speed_x) 
                    enemy_sprite.shoot(all_sprites, enemy_bullets_group, enemy_base_shoot_chance)
                    if enemy_sprite.rect.bottom >= SCREEN_HEIGHT:
                        game_state = GAME_OVER
                        break 
            if game_state == GAME_OVER: 
                pass 
            else: 
                boundary_hit = False
                for enemy_sprite in enemies_group:
                    if enemy_sprite.rect.right > SCREEN_WIDTH or enemy_sprite.rect.left < 0:
                        boundary_hit = True
                        break
                if boundary_hit:
                    enemy_current_speed_x *= -1
                    for e_sprite in enemies_group:
                        e_sprite.rect.y += enemy_speed_y_drop
                        if e_sprite.rect.right > SCREEN_WIDTH: e_sprite.rect.right = SCREEN_WIDTH 
                        if e_sprite.rect.left < 0: e_sprite.rect.left = 0 
                        if e_sprite.rect.bottom >= SCREEN_HEIGHT:
                            game_state = GAME_OVER
                            break
                if not enemies_group: 
                    print("VICTORY! (For now, just ends game state)") 
                    game_state = GAME_OVER 

            # --- Collision Detection ---
            if player: # Ensure player exists for collision checks
                # Player bullets vs Enemies
                for bullet in player_bullets_group:
                    hit_enemies = pygame.sprite.spritecollide(bullet, enemies_group, False) 
                    for enemy_hit in hit_enemies:
                        bullet.kill() 
                        if enemy_hit.take_damage(): # True if enemy died
                            score += enemy_hit.points
                            # Power-up Spawning Logic
                            if random.random() < TOTAL_POWER_UP_SPAWN_CHANCE:
                                # Choose which power-up to spawn
                                choice = random.choices(
                                    list(POWER_UP_WEIGHTS.keys()), 
                                    weights=list(POWER_UP_WEIGHTS.values()), 
                                    k=1
                                )[0]
                                pu = PowerUpItem(enemy_hit.rect.centerx, enemy_hit.rect.centery, choice)
                                all_sprites.add(pu)
                                power_ups_group.add(pu)
                        break 

                # Enemy bullets vs Player
                collided_bullets = pygame.sprite.spritecollide(player, enemy_bullets_group, True) # True: kill bullet
                if collided_bullets:
                    if player.has_shield:
                        player.lose_shield()
                        print("Shield absorbed a hit!")
                    else:
                        game_state = GAME_OVER
                        print("Player hit by enemy bullet!") 

                # Player vs Power-ups
                collected_power_ups = pygame.sprite.spritecollide(player, power_ups_group, True) # True: kill item
                for pu_item in collected_power_ups:
                    pu_item.apply_effect(player) 

    # --- Drawing ---
    screen.fill(BLACK)

    if game_state == SELECTION_SCREEN:
        title_surf = title_font.render("Select Your UFO", True, YELLOW)
        title_rect = title_surf.get_rect(center=(SCREEN_WIDTH // 2, 80))
        screen.blit(title_surf, title_rect)

        item_y_start = 180
        item_spacing = 120
        for idx, ufo_key in enumerate(selectable_ufo_keys):
            ufo_config = UFO_TYPES[ufo_key]
            is_unlocked = ufo_key in unlocked_ufos_list
            
            # UFO Name
            name_text = f"{ufo_config['name']}"
            name_color = WHITE if is_unlocked else (100,100,100) # Dim if locked
            if idx == current_selection_index:
                name_color = YELLOW # Highlight current selection
            
            name_surf = ufo_name_font.render(name_text, True, name_color)
            name_rect = name_surf.get_rect(center=(SCREEN_WIDTH // 2, item_y_start + idx * item_spacing))
            screen.blit(name_surf, name_rect)

            # UFO Preview (simple colored box)
            preview_rect = pygame.Rect(0,0, ufo_config['width'], ufo_config['height'])
            preview_rect.center = (SCREEN_WIDTH // 2 - 150, item_y_start + idx * item_spacing)
            preview_color = ufo_config['color'] if is_unlocked else (50,50,50)
            pygame.draw.rect(screen, preview_color, preview_rect)


            # Status Text (Locked/Unlocked)
            status_text = ""
            status_color = (150,150,150)
            if is_unlocked:
                status_text = "[SELECT]" if idx == current_selection_index else "[Unlocked]"
                status_color = YELLOW if idx == current_selection_index else GREEN
            else:
                unlock_score = UFO_UNLOCK_CRITERIA.get(ufo_key, "N/A")
                status_text = f"[LOCKED - Score {unlock_score}]"
                status_color = RED
            
            status_surf = ufo_status_font.render(status_text, True, status_color)
            status_rect = status_surf.get_rect(center=(SCREEN_WIDTH // 2 + 150, item_y_start + idx * item_spacing))
            screen.blit(status_surf, status_rect)
            
            # Highlight border for currently selected item
            if idx == current_selection_index:
                highlight_rect_padding = 10
                overall_item_rect = pygame.Rect(
                    preview_rect.left - 50, 
                    name_rect.top - highlight_rect_padding,
                    (status_rect.right + 50) - (preview_rect.left - 50) ,
                    name_rect.height + 2 * highlight_rect_padding
                )
                pygame.draw.rect(screen, YELLOW, overall_item_rect, 2) # Border thickness 2

        instr_text = ufo_status_font.render("Arrows to navigate, Enter/Space to select", True, WHITE)
        instr_rect = instr_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 50))
        screen.blit(instr_text, instr_rect)


    elif game_state == PLAYING:
        if player: all_sprites.draw(screen) 
        if score_font:
            score_text_surface = score_font.render(f"Score: {score}", True, YELLOW)
            screen.blit(score_text_surface, (10, 10))

    elif game_state == GAME_OVER:
        if not game_over_processed_this_session: # Logic to process scores and unlocks runs once
            updated_high_score = current_high_score
            if score > current_high_score:
                updated_high_score = score
                print(f"New High Score: {updated_high_score}")

            newly_unlocked_any = False
            for ufo_name, unlock_score_needed in UFO_UNLOCK_CRITERIA.items():
                if updated_high_score >= unlock_score_needed and ufo_name not in unlocked_ufos_list:
                    unlocked_ufos_list.append(ufo_name) # Add to current session's list
                    print(f"UFO Unlocked: {ufo_name}!")
                    newly_unlocked_any = True
            
            if updated_high_score > current_high_score or newly_unlocked_any:
                current_high_score = updated_high_score # Update global for current display
                save_game_data({ # Save updated data
                    "high_score": current_high_score,
                    "unlocked_ufos": unlocked_ufos_list
                })
                if newly_unlocked_any: 
                     print(f"Updated unlocked UFOs list: {unlocked_ufos_list}")
            game_over_processed_this_session = True


        # Display Game Over messages (these are drawn every frame while in GAME_OVER state)
        if game_over_font:
            game_over_text = game_over_font.render("GAME OVER", True, RED)
            text_rect = game_over_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 70))
            screen.blit(game_over_text, text_rect)
        if final_score_font:
            final_score_text = final_score_font.render(f"Final Score: {score}", True, YELLOW)
            score_rect = final_score_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 0))
            screen.blit(final_score_text, score_rect)
            
        if score_font: 
            high_score_display_text = score_font.render(f"High Score: {current_high_score}", True, YELLOW)
            hs_rect = high_score_display_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 50))
            screen.blit(high_score_display_text, hs_rect)
        
        if ufo_status_font: # Re-use for instructions
            instr_text = ufo_status_font.render("Press Enter/Space to return to UFO Selection", True, WHITE)
            instr_rect = instr_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 70))
            screen.blit(instr_text, instr_rect)


    pygame.display.flip()
    clock.tick(60)

# --- Cleanup ---
pygame.font.quit()
pygame.quit()
```
