import pygame
import random
from game_entities import Player, Enemy, Bullet, PowerUpItem, ENEMY_TYPES # ENEMY_TYPES is also in game_entities for now

# --- Pygame Initialization ---
pygame.init()
pygame.font.init()

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

# --- Game Variables ---
score = 0
game_state = "playing" # "playing" or "game_over"

# Enemy global properties (affecting the group)
enemy_initial_speed_x = 1 # Base horizontal speed for the group
enemy_current_speed_x = enemy_initial_speed_x # Current group speed, can change direction
enemy_speed_y_drop = 5 # How much enemies drop when hitting edge
enemy_base_shoot_chance = 0.001 # Base chance for an enemy to shoot per frame

# --- Sprite Groups ---
all_sprites = pygame.sprite.Group()
enemies_group = pygame.sprite.Group()
player_bullets_group = pygame.sprite.Group()
enemy_bullets_group = pygame.sprite.Group()
power_ups_group = pygame.sprite.Group()

# --- UFO Selection ---
# Change this variable to "ALPHA" or "BETA" to select UFO type
selected_ufo_type = "BETA" 

# --- Create Game Objects ---
player = Player(ufo_type_name=selected_ufo_type) # Pass selected type to Player constructor
all_sprites.add(player)

# Enemy Grid Setup
enemy_rows = 3
enemy_cols = 10
enemy_padding = 10
enemy_offset_x = 50
enemy_offset_y = 50
enemy_width = 50 # Default enemy width
enemy_height = 50 # Default enemy height

for r in range(enemy_rows):
    for c in range(enemy_cols):
        x = enemy_offset_x + c * (enemy_width + enemy_padding)
        y = enemy_offset_y + r * (enemy_height + enemy_padding)
        
        enemy_type_name = "standard"
        if r == 0: enemy_type_name = "tank"
        elif r == 1: enemy_type_name = "scout"
        
        enemy = Enemy(x, y, enemy_type_name, enemy_width, enemy_height)
        all_sprites.add(enemy)
        enemies_group.add(enemy)

# --- Main Game Loop ---
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if game_state == "playing":
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    player.shoot(all_sprites, player_bullets_group)

    # --- Game Logic ---
    if game_state == "playing":
        # Player Movement Input
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player.move("left")
        if keys[pygame.K_RIGHT]:
            player.move("right")

        # Update all sprites (Player power-up timer, Bullet movement, PowerUpItem movement)
        all_sprites.update() # Player.update handles its own color/cooldown based on power-up state

        # Enemy Group Movement and Shooting
        for enemy in enemies_group: # Custom update for group behavior
            enemy.update_movement(enemy_current_speed_x) # Individual speed multiplier is in Enemy class
            enemy.shoot(all_sprites, enemy_bullets_group, enemy_base_shoot_chance)
            if enemy.rect.bottom >= SCREEN_HEIGHT:
                game_state = "game_over"
                break 
        if game_state == "game_over": # Break from main playing logic if game over
            pass # Will proceed to drawing game over screen
        else: # Continue with boundary checks only if still playing
            # Enemy Boundary Check for group
            boundary_hit = False
            for enemy in enemies_group:
                if enemy.rect.right > SCREEN_WIDTH or enemy.rect.left < 0:
                    boundary_hit = True
                    break
            if boundary_hit:
                enemy_current_speed_x *= -1
                for e in enemies_group:
                    e.rect.y += enemy_speed_y_drop
                    if e.rect.right > SCREEN_WIDTH: e.rect.right = SCREEN_WIDTH # Correction
                    if e.rect.left < 0: e.rect.left = 0 # Correction
                    if e.rect.bottom >= SCREEN_HEIGHT:
                        game_state = "game_over"
                        break
            if not enemies_group: # All enemies defeated
                print("VICTORY! (For now, just ends game state)") # Placeholder for actual victory screen
                game_state = "game_over" # Or a "victory" state

        # --- Collision Detection ---
        # Player bullets vs Enemies
        for bullet in player_bullets_group:
            hit_enemies = pygame.sprite.spritecollide(bullet, enemies_group, False) # False: don't kill enemy yet
            for enemy_hit in hit_enemies:
                bullet.kill() # Remove bullet
                if enemy_hit.take_damage(): # True if enemy died
                    score += enemy_hit.points
                    # Chance to spawn power-up
                    if random.random() < 0.15: # power_up_spawn_chance
                        pu = PowerUpItem(enemy_hit.rect.centerx, enemy_hit.rect.centery, "RapidFire")
                        all_sprites.add(pu)
                        power_ups_group.add(pu)
                break # Bullet hits one enemy

        # Enemy bullets vs Player
        if pygame.sprite.spritecollide(player, enemy_bullets_group, True): # True: kill bullet on collision
            # For now, player is invulnerable or game over is instant
            # player.health -=1 # if player had health
            # if player.health <=0:
            game_state = "game_over"
            print("Player hit by enemy bullet!") # Log for now

        # Player vs Power-ups
        collected_power_ups = pygame.sprite.spritecollide(player, power_ups_group, True) # True: kill power-up on collision
        for pu in collected_power_ups:
            pu.apply_effect(player) # PowerUpItem.apply_effect also calls self.kill()

    # --- Drawing ---
    screen.fill(BLACK)
    all_sprites.draw(screen) # Draw all sprites

    if game_state == "playing":
        if score_font:
            score_text_surface = score_font.render(f"Score: {score}", True, YELLOW)
            screen.blit(score_text_surface, (10, 10))
    elif game_state == "game_over":
        if game_over_font:
            game_over_text = game_over_font.render("GAME OVER", True, RED)
            text_rect = game_over_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 50))
            screen.blit(game_over_text, text_rect)
        if final_score_font:
            final_score_text = final_score_font.render(f"Final Score: {score}", True, YELLOW)
            score_rect = final_score_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 50))
            screen.blit(final_score_text, score_rect)
            
    pygame.display.flip()
    clock.tick(60)

# --- Cleanup ---
pygame.font.quit()
pygame.quit()
```
